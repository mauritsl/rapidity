
module.exports = function(done) {
  var Promise = require('bluebird');
  
  var slow = function() {
    var str = '';
    for (var i = 0; i < 1e5; ++i) {
      str = str + String(i);
    }
    return 'test output';
  };
  
  var fast = function() {
    return 'test';
  };
  
  var promise = function() {
    return Promise.delay(250).then(function() {
      return Promise.delay(250);
    }).then(function() {
      return 'test';
    });
  };
  
  for (i = 0; i < 3; ++i) {
    var output = slow();
    var output = fast();
  }
  
  return promise().then(function(output) {
    done();
  });
};
