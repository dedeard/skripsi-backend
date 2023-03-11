import { Router } from 'express'
import { auth } from '@/middlewares/auth.middleware'
import * as p from '@/config/permissions'
import * as authC from '@/controllers/auth.controller'
import * as accountC from '@/controllers/account.controller'
import * as roleC from '@/controllers/roles.controller'
import * as userC from '@/controllers/users.controller'
import * as albumC from '@/controllers/album.controller'
import * as mediaC from '@/controllers/media.controller'
import * as infoC from '@/controllers/info.controller'
import * as fieldsC from '@/controllers/fields.controller'
import * as appAlbumsC from '@/controllers/appAlbums.controller'

const route = Router()

route.post('/auth/login', authC.login)

route.get('/account/profile', auth(), accountC.getProfile)
route.put('/account/profile', auth(), accountC.updateProfile)

route.get('/permissions', auth({ isAdmin: true }), roleC.getPermissions)
route.get('/roles', auth({ can: p.READ_ROLE }), roleC.getRoles)
route.get('/roles/:id', auth({ can: p.READ_ROLE }), roleC.getRole)
route.post('/roles', auth({ can: p.CREATE_ROLE }), roleC.createRole)
route.put('/roles/:id', auth({ can: p.UPDATE_ROLE }), roleC.updateRole)
route.delete('/roles/:id', auth({ can: p.DELETE_ROLE }), roleC.deleteRole)

route.get('/users', auth({ can: p.READ_USER }), userC.getUsers)
route.get('/users/:id', auth({ can: p.READ_USER }), userC.getUser)
route.post('/users', auth({ can: p.CREATE_USER }), userC.createUser)
route.put('/users/:id', auth({ can: p.UPDATE_USER }), userC.updateUser)
route.delete('/users/:id', auth({ can: p.DELETE_USER }), userC.deleteUser)

route.get('/app/albums', auth(), appAlbumsC.getAlbums)
route.get('/app/albums/:albumId', auth(), appAlbumsC.getAlbum)
route.get('/app/albums/media/:name', auth(), appAlbumsC.getMedia)

route.get('/albums', auth({ can: p.READ_ALBUM }), albumC.getAlbums)
route.get('/albums/:id', auth({ can: p.READ_ALBUM }), albumC.getAlbum)
route.post('/albums', auth({ can: p.CREATE_ALBUM }), albumC.createAlbum)
route.put('/albums/:id', auth({ can: p.UPDATE_ALBUM }), albumC.updateAlbum)
route.delete('/albums/:id', auth({ can: p.DELETE_ALBUM }), albumC.deleteAlbum)

route.use('/media/file', auth({ can: p.READ_MEDIA }), mediaC.sendMedia)
route.get('/media/download/:mediaId', auth({ can: p.READ_MEDIA }), mediaC.downloadMedia)
route.post('/media/:albumId', auth({ can: p.CREATE_MEDIA }), mediaC.createMedia)
route.delete('/media/:mediaId', auth({ can: p.DELETE_MEDIA }), mediaC.deleteMedia)

route.get('/fields', auth(), fieldsC.getFields)

route.get('/info/counter', auth(), infoC.counter)

export default route
