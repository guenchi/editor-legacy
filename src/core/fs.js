define([
    "hr/hr",
    "hr/promise",
    "hr/utils",
    "models/file"
], function(hr, Q, _, File) {
    var fs = node.require("fs");
    var path = node.require("path");

    var LocalFs = hr.Class.extend({
        virtualPath: function(_path) {
            return path.relative(this.options.base, _path);
        },
        realPath: function(_path) {
            return path.join(this.options.base, _path);
        },

        /*
         * Read a directory content by its path
         *
         * @return Promise([File])
         */
        readdir: function(_path) {
            var that = this;
            _path = this.realPath(_path);

            return Q.nfcall(fs.readdir, _path)
            .then(function(files) {
                return Q.all(
                    _.chain(files)
                    .filter(function() {
                        if (file == "." || file == "..") return false;
                        return true;
                    })
                    .map(function(file) {
                        var f_path = path.join(_path, file);

                        return Q.nfcall(fs.stat, f_path)
                        .then(function(_stat) {
                            return new File({
                                fs: that,
                            }, {
                                'path': that.virtualPath(f_path),
                                'name': file,
                                'type': _stat.isDirectory() ? File.TYPE.DIRECTORY : File.TYPE.FILE
                            });
                        });
                    })
                    .value()
                );
            });
        },

        /*
         * Read a file by its path
         *
         * @return Promise(String)
         */
        read: function(_path) {
            var that = this;
            _path = this.realPath(_path);

            return Q.nfcall(fs.readFile, _path)
            .then(function(buf) {
                return buf.toString();
            });
        },

        /*
         * Write a file by its path
         *
         * @return Promise()
         */
        write: function(_path, content) {
            var that = this;
            _path = this.realPath(_path);

            return Q.nfcall(fs.writeFile, _path, content);
        },

        /*
         * Commit all changes
         *
         * @return Promise()
         */
        commit: function(message) {
            return Q();
        }
    });

    return LocalFs;
});