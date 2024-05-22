import browserSync from 'browser-sync'
import fs from 'fs'
import gulp from 'gulp'
import changed from 'gulp-changed'
import clean from 'gulp-clean'
import fileInclude from 'gulp-file-include'
import plumber from 'gulp-plumber'
import { getBuildDir, plumberNotify } from './tools.js'

const server = browserSync.create()
export const clearBuild = done => {
	if (fs.existsSync(getBuildDir())) {
		return gulp
		.src(getBuildDir(), { read: false })
		.pipe(clean({ force: true }))
	}
	done()
}

export const generateHTML = async () => {
	const { default: config } = await import(`../config.js?v=${Date.now()}`)
	return gulp.src(['./src/html/**/*.html', '!./src/html/part/*.html', '!./src/html/blocks/*.html'])
	           .pipe(changed(getBuildDir()))
	           .pipe(plumber(plumberNotify('HTML')))
	           .pipe(fileInclude({ context: config }))
	           .pipe(gulp.dest(getBuildDir()))
	           .pipe(server.stream())
}

export const generateFonts = () =>
  gulp.src('./src/fonts/**/*')
      .pipe(changed(getBuildDir('fonts/')))
      .pipe(gulp.dest(getBuildDir('fonts/')))

export const generateFiles = () =>
  gulp.src('./src/files/**/*')
      .pipe(changed(getBuildDir('files/')))
      .pipe(gulp.dest(getBuildDir('files/')))

export const generatePWA = () =>
  gulp.src(['./src/*.png', './src/*.ico', './src/*.webmanifest'])
      .pipe(changed(getBuildDir()))
      .pipe(gulp.dest(getBuildDir()))
      .pipe(server.stream())

