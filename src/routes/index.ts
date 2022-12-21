import { Router } from 'express'
import { auth } from '@/middlewares/auth.middleware'
import * as p from '@/config/permissions'
import * as authC from '@/controllers/auth.controller'
import * as accountC from '@/controllers/account.controller'
import * as roleC from '@/controllers/roles.controller'
import * as userC from '@/controllers/users.controller'
import * as albumC from '@/controllers/album.controller'
import * as mediaC from '@/controllers/media.controller'
import * as shareC from '@/controllers/share.controller'
import * as infoC from '@/controllers/info.controller'
import * as appAlbumsC from '@/controllers/appAlbums.controller'

const route = Router()

route.post('/auth/register', authC.register)
route.post('/auth/login', authC.login)
route.post('/auth/password', authC.forgotPassword)
route.get('/auth/password', authC.verifyResetPasswordCode)
route.put('/auth/password', authC.resetPassword)

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
route.post('/users/:id/:albumId', auth({ can: p.MANAGE_USER_ALBUM }), userC.addAlbumToUser)
route.delete('/users/:id/:albumId', auth({ can: p.MANAGE_USER_ALBUM }), userC.removeAlbumFromUser)

route.get('/app/albums', auth(), appAlbumsC.getAlbums)
route.get('/app/albums/:albumId', auth(), appAlbumsC.getAlbum)
route.get('/app/albums/media/:name', auth(), appAlbumsC.getMedia)

route.get('/albums', auth({ cans: [p.READ_ALBUM, p.MANAGE_USER_ALBUM] }), albumC.getAlbums)
route.get('/albums/:id', auth({ can: p.READ_ALBUM }), albumC.getAlbum)
route.post('/albums', auth({ can: p.CREATE_ALBUM }), albumC.createAlbum)
route.put('/albums/:id', auth({ can: p.UPDATE_ALBUM }), albumC.updateAlbum)
route.delete('/albums/:id', auth({ can: p.DELETE_ALBUM }), albumC.deleteAlbum)

route.use('/media/file', auth({ can: p.READ_MEDIA }), mediaC.sendMedia)
route.get('/media/download/:mediaId', auth({ can: p.READ_MEDIA }), mediaC.downloadMedia)
route.post('/media/:albumId', auth({ can: p.CREATE_MEDIA }), mediaC.createMedia)
route.delete('/media/:mediaId', auth({ can: p.DELETE_MEDIA }), mediaC.deleteMedia)

route.get('/share', shareC.sharedAlbum)
route.use('/share/file/:name', shareC.sharedFile)
route.get('/share/:id', auth({ can: p.READ_SHARE }), shareC.getShares)
route.post('/share/:id', auth({ can: p.CREATE_SHARE }), shareC.createShare)
route.delete('/share/:id', auth({ can: p.DELETE_SHARE }), shareC.deleteShare)

route.get('/info/counter', auth(), infoC.counter)

export default route
