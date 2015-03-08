uuid = require 'node-uuid'
crypto = require 'crypto'
jsonv = require('jsonschema').Validator
v = new jsonv()
msgpack = require 'msgpack'
urlsafe = require 'urlsafe-base64'
_       = require('underscore')
extractor = require 'keyword-extractor'
md5 = require 'MD5'
shortId = require 'shortid'
nodemailer = require 'nodemailer'
cheerio = require 'cheerio'
request = require 'request'

module.exports = (socket,db, winston, raygunClient, newrelic, io) ->

  profiles = db.collection('profiles')
  posts = db.collection('posts')
  kw = db.collection('keywords')


  self = { }

  self.populate = ->
    ->
      data = require './data.json'
      innerdata = data.data
      expire = new Date()
      expire.setDate expire.getDate() + 7
      endDate = new Date()
      endDate.setDate endDate.getDate() + 100
      if(expire < endDate)
        expire.setDate endDate.getDate() + 7
      for datapoint in innerdata
        posts.insert
          title: ((datapoint.title ? ['no title'])[0]).toLowerCase()
          description: (datapoint.duties ? ['no Duties'])[0] + "Email:#{(datapoint.email ? ['no email'])[0]},Phone: #{(datapoint.phone ? ['no phone'])[0]}"
          date: new Date()
          endDate: endDate
          tags: ['purdue']
          skills: []
          comp: ((datapoint.comp ? ['0'])[0]).toString()
          location:
            type: "Point"
            coordinates: [-86.911147 + Math.random()/10, 40.427709 + Math.random()/10]
          expire: expire
          remarks: "Email: #{(datapoint.email ? ['no email'])[0]},
          Phone: #{(datapoint.phone ? ['no phone'])[0]}"
          uuid: datapoint._source[0]
          postid: uuid.v1()
          , (err, docs) ->
            if !err
              winston.info "new post inserted"
              socket.emit 'response',
                code: 200
                message: 'post created'
                errorcode: 0
                successcode: 302
                data: ''
              io.emit 'update'

  self.connect = ->
    ->
      clientUUID = uuid.v1()
      socket.emit 'handshake',
        uuid: clientUUID
      winston.info "client is connected - #{socket.id}"

  registerSchema =
    type: 'object'
    properties:
      name:
        type: 'string'
      email:
        type: 'string'
      profession:
        type: 'string'
      phone:
        type: 'string'
      talents:
        type: 'array'
      pass:
        type: 'string'
      nonce:
        type: 'string'
    required:
      ['name','email','pass', 'phone']

  self.register = ->
    (data) ->
      newrelic.recordMetric 'Custom/Connection/RegisterAmount', 1
      #check against existing email
      vdata = v.validate data, registerSchema
      winston.info data
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce

        return
      else
        winston.info 'client request verification passed'
        ID = uuid.v1()
        profiles.find($or: [{email: data.email}, {uuid: ID}])
        .toArray (err, docs) ->
          if docs.length > 0
            winston.warn 'trying to insert existing user'
            socket.emit 'response',
              code: 201
              message: 'user exist'
              errorcode: 400
              successcode: 0
              data: ''
              nonce: data.nonce
            return
          else
            h1 = crypto.createHash 'sha256'
              .update ID
              .digest 'hex'
            h2 = crypto.createHash 'sha256'
              .update new Date().toISOString()
              .digest 'hex'
            key = crypto.createHash 'sha256'
              .update h1 + h2
              .digest 'hex'
            hmac = crypto.createHmac 'sha256', key
            userPass = hmac.update(data.pass).digest('hex')
            emptyArray = []
            profiles.insert
              name:         data.name
              email:        data.email
              phone:        data.phone
              profession:   data.profession
              talents:      data.talents
              accepted:     emptyArray
              uuid:         ID
              password:     userPass
              secret:       key
              , (err, docs) ->
                winston.info "new user inserted :#{data.name}:#{data.uuid}"
                socket.emit 'response',
                  code: 200
                  message: 'user created'
                  errorcode: 0
                  successcode: 300
                  data: ''
                  nonce: data.nonce

  ###response codes
    200 - OK
    201 - ERROR
  error codes
    400 - USER EXIST
    401 - USER NOT EXIST
    402 - LOGIN ERROR
    403 - TOKEN FORMAT
    404 - AUTH ERROR
    405 - DELETE FAILED
    406 - REQUEST INVALID
    407 - ALTER FAILED
    408 - JOB ACCEPTED
    409 - POST NOT EXIST
    410 - WITHDREW FAILED
    411 - POST CREATE FAILED
  success codes
    300 - USER CREATED
    301 - USER LOGGED IN
    302 - POST CREATED
    303 - QUERY COMPLETE
    304 - POST DELETED
    305 - WHOAMI COMPLETE
    306 - EMAILHASH COMPLETE
    307 - ALTER COMPLETED
    308 - JOB ACCEPT FAILED
    309 - WITHDREW COMPLETE
  ###

  self.disconnect = ->
    ->
      winston.info 'client disconnected.'

  postfomidSchema =
    type: 'object'
    properties:
      uuid:
        type: 'array'
    required:
      ['uuid']

  self.postfromid = ->
    (data) ->
      vdata = v.validate data, postfomidSchema
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        posts.find({postid: {$in: data.uuid}}).toArray (err, docs) ->
          socket.emit 'response',
            code: 200
            message: 'search data'
            errorcode: 0
            successcode: 303
            data: docs
            nonce: data.nonce


  self.checkauth = (token, callback) ->
    winston.info 'server requested to check authentication'
    if not urlsafe.validate token
      socket.emit 'response',
        code: 201,
        message: 'token format validation failed - non urlsafe',
        errorcode: 403,
        successcode: 0,
        data: ''
        nonce: data.nonce
      callback null
    else
      try
        meta = msgpack.unpack urlsafe.decode token
      catch error
        socket.emit 'response',
          code: 201,
          message: 'token format validation failed - non msgpack',
          errorcode: 403,
          successcode: 0,
          data: ''
          nonce: data.nonce
        callback null
      if not _.isArray(meta)
        socket.emit 'response',
          code: 201,
          message: 'token format validation failed - non array',
          errorcode: 403,
          successcode: 0,
          data: ''
          nonce: data.nonce
        callback null
      else
        _payload = msgpack.pack(meta.slice(0,-1))
        _uuid = meta[0]
        _time = meta[1]
        _signature = meta[2]
        profiles.findOne uuid: _uuid, (err, doc) ->
          if !doc
            winston.warn 'user does not exist'
            socket.emit 'response',
              code: 201
              message: 'user does not exist'
              errorcode: 401
              successcode: 0
              data: ''
              nonce: data.nonce
            callback null
          else
            hmac = crypto.createHmac 'sha256', doc.secret
            hash = hmac.update(_payload).digest('hex')
            if _signature is hash
              winston.info 'user: ' + doc.name + ' authorized'
              user =
                name: doc.name
                email: doc.email
                phone: doc.phone
                accepted: doc.accepted
                profession: doc.profession
                talents: doc.talents
                uuid: doc.uuid
              callback user
            else
              winston.warn 'user token not match'
              socket.emit 'response',
                code: 201
                message: 'auth error'
                errorcode: 404
                successcode: 0
                data: ''
                nonce: data.nonce
              callback null

  reauthSchema =
    type: 'object'
    properties:
      token:
        type: 'string'
    required:
      ['token']

  self.reauth = ->
    (data, callback) ->
      vdata = v.validate data, reauthSchema
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        winston.info 'client request verification passed'
        winston.info 'client requested reauthentication'
        if not urlsafe.validate data.token
          socket.emit 'response',
            code: 201,
            message: 'token format validation failed - non urlsafe',
            errorcode: 403,
            successcode: 0,
            data: ''
            nonce: data.nonce
        else
          try
            meta = msgpack.unpack urlsafe.decode data.token
          catch error
            socket.emit 'response',
              code: 201,
              message: 'token format validation failed - non msgpack',
              errorcode: 403,
              successcode: 0,
              data: ''
              nonce: data.nonce
          if not _.isArray(meta)
            socket.emit 'response',
              code: 201,
              message: 'token format validation failed - non array',
              errorcode: 403,
              successcode: 0,
              data: ''
              nonce: data.nonce
          else
            _payload = msgpack.pack(meta.slice(0,-1))
            _uuid = meta[0]
            _time = meta[1]
            _signature = meta[2]
            profiles.findOne uuid: _uuid, (err, doc) ->
              if !doc
                winston.warn 'user does not exist'
                socket.emit 'response',
                  code: 201
                  message: 'user does not exist'
                  errorcode: 401
                  successcode: 0
                  data: ''
                  nonce: data.nonce
              else
                hmac = crypto.createHmac 'sha256', doc.secret
                hash = hmac.update(_payload).digest('hex')
                if _signature is hash
                  winston.info 'user: ' + doc.name + ' logged in'
                  socket.emit 'response',
                    code: 200
                    message: 'user loggedin'
                    errorcode: 0
                    successcode: 301
                    data: data.token
                    nonce: data.nonce
                    ##add socket into receiving group
                else
                  winston.warn 'user password not match'
                  socket.emit 'response',
                    code: 201
                    message: 'login error'
                    errorcode: 402
                    successcode: 0
                    data: ''
                    nonce: data.nonce

  loginSchema =
    type: 'object'
    properties:
      email:
        type: 'string'
      password:
        type: 'string'
    required:
      ['email', 'password']

  self.login = ->
    (data) ->
      newrelic.recordMetric 'Custom/Connection/LoginRequest', 1
      if !data
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: ''
          nonce: data?.nonce
        return
      winston.info data
      vdata = v.validate data, loginSchema
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        winston.info 'client request verification passed'
        winston.info 'client trying to login.'
        profiles.findOne email: data.email, (err, doc) ->
          if !doc
            winston.warn 'user does not exist'
            socket.emit 'response',
              code: 201
              message: 'user does not exist'
              errorcode: 401
              successcode: 0
              data: ''
              nonce: data.nonce
            return
          else
            hmac = crypto.createHmac 'sha256', doc.secret
            userPass = hmac.update(data.password).digest('hex')
            if userPass is doc.password
              winston.info 'user: ' + doc.name + ' logged in'
              token = self.createToken uuid: doc.uuid, secret: doc.secret
              socket.emit 'response',
                code: 200
                message: 'user loggedin'
                errorcode: 0
                successcode: 301
                data: token
                nonce: data.nonce
                #add socket in receiving group
            else
              winston.warn 'user password not match'
              socket.emit 'response',
                code: 201
                message: 'login error'
                errorcode: 402
                successcode: 0
                data: ''
                nonce: data.nonce

  ###
  {
    title: '',
    description: '',
    date: '', tags:'',
    skills:'',comp: '',
    location:'',
    expire:'',
    remarks:'',
    accessToken:'', uuid:''
  }
  ###

  deleteSchema =
    type: 'object'
    properties:
      token:
        type: 'string'
      postid:
        type: 'string'
    required:
      ['token', 'postid']


  self.delete = ->
    (data) ->
      vdata = v.validate data, deleteSchema
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        winston.info 'client request verification passed'
        winston.info 'user delete post'
        self.checkauth data.token, (user) ->
          if user
            winston.info 'user ' + user.name + ' requested to delete ' +
            data.postid
            posts.remove
              postid: data.postid
              uuid: user.uuid
              , (err, result) ->
                if result
                  winston.info "post deleted: #{data.postid}"
                  socket.emit 'response',
                    code: 200
                    message: 'post deleted'
                    errorcode: 0
                    successcode: 304
                    data: ''
                    nonce: data.nonce
                  io.emit 'update'
                else
                  winston.info "post delete failed: #{data.postid}"
                  socket.emit 'response',
                    code: 201
                    message: 'post delete failed'
                    errorcode: 0
                    successcode: 405
                    data: ''
                    nonce: data.nonce
                if err
                  raygunClient err
                  winston.error err

  extractorOptions =
    language:"english",
    remove_digits: true,
    return_changed_case:true

  postSchema =
    type: 'object'
    properties:
      title:
        type: 'string'
      description:
        type: 'string'
      skills:
        type: 'array'
      comp:
        type: 'string'
      duration:
        type: 'number'
      location:
        type: 'object'
      remarks:
        type: 'string'
      token:
        type: 'string'
    required:
      ['token', 'remarks', 'location', 'comp', 'skills','description', 'title',
      'duration']

  editSchema =
    type: 'object'
    properties:
      data:
        type: 'string'
      type:
        type: 'string'
      postid:
        type: 'string'
      token:
        type: 'string'
    required:
      ['token', 'data', 'type', 'postid']

  self.edit = ->
    (data) ->
      ##Edit existing data here
      vdata = v.validate data, editSchema
      console.log vdata
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        ##Input valid, starting prepare to edit
        self.checkauth data.token, (user) ->
          if user
            winston.info 'user ' + user.name + ' requested to delete ' +
            data.postid
            query = {}
            query[data.type] = data.data
            posts.update
              postid: data.postid
              uuid: user.uuid
              ,
                $set:
                  query
              , (err, result) ->
                if result
                  winston.info "post altered: #{data.postid}"
                  socket.emit 'response',
                    code: 200
                    message: 'post altered'
                    errorcode: 0
                    successcode: 307
                    data: ''
                    nonce: data.nonce
                  io.emit 'update'
                else
                  winston.info "post alter failed: #{data.postid}"
                  socket.emit 'response',
                    code: 201
                    message: 'post alter failed'
                    errorcode: 0
                    successcode: 407
                    data: ''
                    nonce: data.nonce
                if err
                  raygunClient err
                  winston.error err

  edituserSchema =
    type: 'object'
    properties:
      data:
        type: 'string'
      type:
        type: 'string'
      token:
        type: 'string'
    required:
      ['token', 'data', 'type']

  self.editprofile = ->
    (data) ->
      ##Edit a user profile
      vdata = v.validate data, edituserSchema
      console.log vdata
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        ##Input valid, starting prepare to edit
        self.checkauth data.token, (user) ->
          if user
            winston.info 'user ' + user.name + ' requested to alter profile' +
            user.postid
            query = {}
            query[data.type] = data.data
            profiles.update
              uuid: user.uuid
              ,
                $set:
                  query
              , (err, result) ->
                if result
                  winston.info "profile altered: #{data.uuid}"
                  socket.emit 'response',
                    code: 200
                    message: 'profile altered'
                    errorcode: 0
                    successcode: 307
                    data: ''
                    nonce: data.nonce
                else
                  winston.info "profile alter failed: #{data.uuid}"
                  socket.emit 'response',
                    code: 201
                    message: 'profile alter failed'
                    errorcode: 0
                    successcode: 407
                    data: ''
                    nonce: data.nonce
                if err
                  raygunClient err
                  winston.error err


  acceptSchema =
    type: 'object'
    properties:
      postid:
        type: 'string'
      token:
        type: 'string'
    required:
      ['token', 'postid']


  self.accept = ->
    (data) ->
      newrelic.recordMetric 'Custom/Connection/JobAccepted', 1
      ##accept a job
      ##Edit a user profile
      vdata = v.validate data, acceptSchema
      console.log vdata
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        ##Input valid, starting prepare to edit
        self.checkauth data.token, (user) ->
          if user
            winston.info 'user ' + user.name + ' requested to accept job' +
            user.postid
            posts.find({postid: data.postid})
            .toArray (err, docs) ->
              if docs.length < 1
                winston.warn 'post does not exist'
                socket.emit 'response',
                  code: 201
                  message: 'post does not exist'
                  errorcode: 409
                  successcode: 0
                  data: ''
                  nonce: data.nonce
                return
              else
                if _.indexOf(user.accepted, data.postid) != -1
                  socket.emit 'response',
                    code: 201
                    message: 'job accepted failed - uuid exists'
                    errorcode: 0
                    successcode: 408
                    data: ''
                    nonce: data.nonce
                  return
                ## Push uuid
                user.accepted.push data.postid
                query = {}
                query['accepted'] = user.accepted
                profiles.update
                  uuid: user.uuid
                  ,
                    $set:
                      query
                  , (err, result) ->
                    if result
                      winston.info "job accepted: #{data.postid}"
                      socket.emit 'response',
                        code: 200
                        message: 'job accepted'
                        errorcode: 0
                        successcode: 308
                        data: ''
                        nonce: data.nonce
                    else
                      winston.info "job accepted: #{data.postid}"
                      socket.emit 'response',
                        code: 201
                        message: 'job accepted failed'
                        errorcode: 0
                        successcode: 408
                        data: ''
                        nonce: data.nonce
                    if err
                      raygunClient err
                      winston.error err


  self.post = ->
    (data) ->
      newrelic.recordMetric 'Custom/Connection/PostAmount', 1
      vdata = v.validate data, postSchema
      console.log vdata
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        winston.info 'client request verification passed'
        winston.info 'user post'
        keywords = extractor.extract(data.description, extractorOptions)
        winston.info 'keywords:'
        winston.info keywords
        user = self.checkauth data.token, (user) ->
          if user
            winston.info 'user ' + user.name + ' authorized to post'
            ##Using duratino to set expire date
            expire = new Date()
            expire.setDate expire.getDate() + 7
            endDate = new Date()
            endDate.setDate endDate.getDate() + data.duration
            if(expire < endDate)
              expire.setDate endDate.getDate() + 7
            ##Insert all keywords in database
            for word in keywords
              kw.insert
                keyword: word
                hitrate: 0
                , (err, docs) ->
                  winston.info "keywords inserted successfully."
            if data.title.length > 100
              data.title = data.title.substring 0, 100
            winston.info data
            posts.insert
              title: data.title
              description: data.description
              date: new Date()
              endDate: endDate
              tags: keywords
              skills: data.skills
              comp: data.comp
              location: data.location
              expire: expire
              remarks: data.remarks
              uuid: user.uuid
              postid: uuid.v1()
              , (err, docs) ->
                if !err
                  winston.info "new post inserted: #{data.title}:
                  #{data.location}"
                  socket.emit 'response',
                    code: 200
                    message: 'post created'
                    errorcode: 0
                    successcode: 302
                    data: ''
                    nonce: data.nonce
                  io.emit 'update'
                else
                  winston.error err
                  winston.info "new post create failed: #{data.title}:
                  #{data.location}"
                  socket.emit 'response',
                    code: 201
                    message: 'post create failed'
                    errorcode: 0
                    successcode: 411
                    data: err
                    nonce: data.nonce

          else
            winston.warn 'user not authorized or authentication failed'
            socket.emit 'response',
              code: 201
              message: 'authentication failed - auth failed'
              errorcode: 404
              successcode: 0
              data: ''
              nonce: data.nonce

  geosearchSchema =
    type: 'object'
    properties:
      location:
        type: 'object'
      maxDist:
        type: 'number'
    required:
      ['location', 'maxDist']

  self.geosearch = ->
    (data) ->
      vdata = v.validate data, geosearchSchema
      console.log vdata
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        winston.info 'client input verification passed'
        posts.find({location: { $near:{$geometry: data.location, $maxDistance:
          data.maxDist}}}).toArray (err, docs) ->
          socket.emit 'response',
            code: 200
            message: 'search data'
            errorcode: 0
            successcode: 303
            data: docs
            nonce: data.nonce


  searchbykeySchema =
    type: 'object'
    properties:
      keywords:
        type: 'array'
    required:
      ['keywords']

  self.searchbykey = ->
    (data) ->
      vdata = v.validate data, searchbykeySchema
      console.log vdata
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        posts.find({tags: { $all: data.keywords}}).toArray (err, docs) ->
          socket.emit 'response',
            code: 200
            message: 'search data'
            errorcode: 0
            successcode: 303
            data: docs
            nonce: data.nonce


  emailhashSchema =
    type: 'object'
    properties:
      uuid:
        type: 'string'
    required:
      ['uuid']

  self.emailhash = ->
    (data) ->
      vdata = v.validate data, emailhashSchema
      console.log vdata
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        profiles.findOne uuid: data.uuid, (err, doc) ->
          if !doc
            winston.warn 'user does not exist'
            socket.emit 'response',
              code: 201
              message: 'user does not exist'
              errorcode: 401
              successcode: 0
              data: ''
              nonce: data.nonce
            return
          else
            socket.emit 'response',
              code: 200
              message: 'user does exist'
              errorcode: 0
              successcode: 306
              data: md5(doc.email)
              nonce: data.nonce

  uuid2phoneSchema =
    type: 'object'
    properties:
      uuid:
        type: 'string'
    required:
      ['uuid']

  self.uuid2phone = ->
    (data) ->
      vdata = v.validate data, uuid2phoneSchema
      console.log vdata
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        profiles.findOne uuid: data.uuid, (err, doc) ->
          if !doc
            winston.warn 'user does not exist'
            socket.emit 'response',
              code: 201
              message: 'user does not exist'
              errorcode: 401
              successcode: 0
              data: ''
              nonce: data.nonce
            return
          else
            socket.emit 'response',
              code: 200
              message: 'user does exist'
              errorcode: 0
              successcode: 306
              data: [doc.email, doc.phone]
              nonce: data.nonce


  self.queryall = ->
    (data) ->
      posts.find({}).toArray (err, docs) ->
        socket.emit 'response',
          code: 200
          message: 'all data'
          errorcode: 0
          successcode: 303
          data: docs
          nonce: data?.nonce

  whoamiSchema =
    type: 'object'
    properties:
      token:
        type: 'string'
    required:
      ['token']

  self.whoami = ->
    (data) ->
      vdata = v.validate data, whoamiSchema
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        winston.info 'client request verification passed'
        self.checkauth data.token, (user) ->
          if user
            user.emailhash = md5(user.email)
            socket.emit 'response',
              code: 200
              message: 'whoami query'
              errorcode: 0
              successcode: 305
              data: user
              nonce: data.nonce

  withdrawSchema =
    type: 'object'
    properties:
      postid:
        type: 'string'
      token:
        type: 'string'
    required:
      ['token', 'postid']

  self.withdraw = ->
    (data) ->
      ##Withdraw a current application
      vdata = v.validate data, acceptSchema
      console.log vdata
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        ##user passed input validation
        self.checkauth data.token, (user) ->
          if user
            winston.info 'user ' + user.name + ' requested to withdraw job' +
            user.postid
            if _.indexOf(user.accepted, data.postid) == -1
              winston.warn 'post does not exist'
              socket.emit 'response',
                code: 201
                message: 'post does not exist'
                errorcode: 409
                successcode: 0
                data: ''
                nonce: data.nonce
              return
            else
              ## Push uuid
              query = {}
              user.accepted.splice(_.indexOf(user.accepted, data.postid), 1)
              query['accepted'] = user.accepted
              profiles.update
                uuid: user.uuid
                ,
                  $set:
                    query
                , (err, result) ->
                  if result
                    winston.info "job withdrew: #{data.postid}"
                    socket.emit 'response',
                      code: 200
                      message: 'job withdrew'
                      errorcode: 0
                      successcode: 309
                      data: ''
                      nonce: data.nonce
                  else
                    winston.info "job withdrew: #{data.postid}"
                    socket.emit 'response',
                      code: 201
                      message: 'job withdrew failed'
                      errorcode: 0
                      successcode: 410
                      data: ''
                      nonce: data.nonce
                  if err
                    raygunClient err
                    winston.error err

  self.ping = ->
    ->
      winston.info 'recieved ping from MotionDex/Mocha, keep alive.'

  self.createToken = (user) ->
    time = Math.floor(new Date().getTime() / 1000)
    meta = [user.uuid, time]
    payload = msgpack.pack meta
    hmac = crypto.createHmac 'sha256', user.secret
    hash = hmac.update(payload).digest('hex')
    meta.push hash
    urlsafe.encode msgpack.pack meta
  self.error = ->
    (error) ->
      newrelic.recordMetric 'Custom/Connection/ErrorAmount', 1
      if process.env.PRODUCTION?
        raygunClient.send error
      winston.error error
      socket.disconnect()

  changepassSchema =
    type: 'object'
    properties:
      email:
        type: 'string'
    required:
      ['email']

  self.changePass = ->
    (data) ->
      vdata = v.validate data, changepassSchema
      console.log vdata
      if vdata.errors.length > 0
        winston.error 'client input invalid'
        socket.emit 'response',
          code: 201
          message: 'request invalid'
          errorcode: 406
          successcode: 0
          data: vdata.errors[0].message
          nonce: data.nonce
        return
      else
        winston.info 'client request verification passed'
        profiles.findOne email: data.email, (err, doc) ->
          if !doc
            socket.emit 'response',
              code: 201
              message: 'account not found'
              errorcode: 401
              successcode: 0
              data: ''
              nonce: data.nonce
          else
            newpass = shortId.generate()
            hmac = crypto.createHmac 'sha256', doc.secret
            userPass = hmac.update(newpass).digest('hex')
            profiles.update
              email: data.email
              ,
                $set:
                  password: userPass
              , (err, result) ->
                if result
                  winston.info "profile altered: #{data.uuid}"
                  socket.emit 'response',
                    code: 200
                    message: 'profile altered'
                    errorcode: 0
                    successcode: 307
                    data: ''
                    nonce: data.nonce
                else
                  winston.info "profile alter failed: #{data.uuid}"
                  socket.emit 'response',
                    code: 201
                    message: 'profile alter failed'
                    errorcode: 0
                    successcode: 407
                    data: ''
                    nonce: data.nonce
                if err
                  raygunClient err
                  winston.error err
            transporter = nodemailer.createTransport
              service: 'gmail'
              auth:
                user: 'nerve.server@gmail.com'
                pass: 'tNbFXjP2wAfMW4'
            transporter.sendMail
              from: 'nerve.server@gmail.com'
              to: data.email
              subject: 'This is your new password.'
              text: "For username: #{data.email}, new password is #{newpass}"


  return self
