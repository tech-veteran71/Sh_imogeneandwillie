const gulp = require("gulp");
const ext_replace = require('gulp-ext-replace');

// Just to get global.js --> global.min.js on save
gulp.task("watch:js", () => {
  gulp.watch(["./assets/global.js"], () => {
    return gulp
      .src("./assets/global.js")
      .pipe(ext_replace('.min.js'))
      .pipe(gulp.dest("./assets"));
  });
});
