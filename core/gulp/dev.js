import { task, src, watch, dest } from 'gulp'
import browserSync from 'browser-sync'
import fs from 'fs'
import changed from 'gulp-changed'
import fileInclude from 'gulp-file-include'
import sourceMaps from 'gulp-sourcemaps'
import path from 'path'
import config from '../../config.js'
import { sync } from '@lmcd/gulp-dartsass'
import * as sass from 'sass'
import { getBuildDir, getConfig, getHtmlSrc, getSrcDir, plumberNotify } from '../tools.js'
import esBuild from 'gulp-esbuild'

const server = browserSync.create()

task('html:dev', async () =>
  src(getHtmlSrc())
  .pipe(plumberNotify('HTML'))
  .pipe(fileInclude({ context: await getConfig() }))
  .pipe(dest(getBuildDir()))
  .pipe(server.stream()),
)

task('sass:dev', () =>
  src(getSrcDir('scss/*.scss'))
  .pipe(plumberNotify('SCSS'))
  .pipe(sourceMaps.init())
  .pipe(sync(sass))
  .pipe(sourceMaps.write('.'))
  .pipe(dest(getBuildDir('css/')))
  .pipe(server.stream()),
)

task('images:dev', () =>
  src(getSrcDir('img/**/*'), { encoding: false })
  .pipe(changed(getBuildDir('img/')))
  .pipe(dest(getBuildDir('img/')))
  .pipe(server.stream()),
)

task('js:dev', () =>
  src(getSrcDir('/js/index.js'))
  .pipe(plumberNotify('JS'))
  .pipe(esBuild({
	  outfile: 'index.js',
	  bundle: true,
	  sourcemap: true,
	  format: 'iife',
	  target: 'es6',
  }))
  .pipe(dest(getBuildDir('js/')))
  .pipe(server.stream()),
)

task('serve:dev', async () => {
	const options = {
		server: {
			baseDir: getBuildDir(),
		},
		port: config.PORT,
		open: config.SERVER_OPEN,
		https: config.HTTPS,
		tunnel: config.TUNNEL,
		notify: false,
		logPrefix: "СrossFoxGulp",
		ghostMode: config.GHOSTMODE,
		rewriteRules: [
			{
				match: /test/g,
				fn: function (req, res, match) {

					return 'kittenz';
				}
			}
		],
		// callbacks: {
		// 	ready: function(err, bs) {
		//
		// 		bs.addMiddleware("*", function (req, res) {
		// 			console.log(4445);
		// 			res.end()
		// 		});
		// 	}
		// }

	}
	const CERT_DIR = path.join(process.cwd(), 'ssl')
	if (config.HTTPS && fs.existsSync(CERT_DIR) && fs.existsSync(path.join(CERT_DIR, 'key.key')) && fs.existsSync(path.join(CERT_DIR, 'cert.crt'))) {
		options.https = {
			key: path.join(CERT_DIR, 'key.key'),
			cert: path.join(CERT_DIR, 'cert.crt'),
		}
	}

	server.init(options)

	watch(getSrcDir('scss/**/*.scss'), task('sass:dev'))
	watch(getSrcDir('html/**/*.html'), task('html:dev')).on('change', server.reload)
	watch(getSrcDir('img/**/*'), task('images:dev')).on('change', server.reload)
	watch(getSrcDir('fonts/**/*'), task('fonts:dev')).on('change', server.reload)
	watch(getSrcDir('/js/**/*.js'), task('js:dev'))
	watch('./*.js', task('js:dev')).on('change', server.reload)
})

