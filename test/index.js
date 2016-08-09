
var test = function (name, path) {
    describe(name, function () {
        require(path);
    })
}

test('@textile', './textile');
test('@fabric', './fabric');
test('@accessories', './accessories');


