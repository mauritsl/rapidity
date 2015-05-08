
var falafel = require('falafel');
var fs = require('fs');

var data = {};
var pwd = process.cwd();

var posToLineCol = function(string, pos) {
  var before = string.substring(0, pos).split("\n");
  var line = before.length;
  var col = before[before.length - 1].length;
  return line + ':' + col;
};

require.extensions['.js'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  
  // @todo Matching (anti-)patterns must be configurable.
  if (!filename.match(/(node_modules)/) && !filename.match(/\/[^\/]*test[^\/]*\.js$/)) {
    content = falafel(content, function(node) {
      if (node.type === 'CallExpression') {
        var start = posToLineCol(content, node.start);
        var end = posToLineCol(content, node.end);
        node.update('rapidityWrap(__filename, "' + start + ':' + end + '", this, function() { return ' + node.source() + '; })');
      }
    });
  }
  
  module._compile(content.toString(), filename);
};


var wrap = function(file, position, self, fn) {
  file = file.substring(pwd.length);
  var start = new Date();
  
  var register = function() {
    var end = new Date();
    var interval = end - start;
    if (typeof data[file] === 'undefined') {
      data[file] = {};
    }
    if (typeof data[file][position] === 'undefined') {
      data[file][position] = [interval];
    }
    else {
      data[file][position].push(interval);
    }
  };
  
  var output = fn.apply(self);
  if (output !== null && typeof output === 'object' && typeof output.then === 'function' && typeof output.catch === 'function') {
    output = output.then(function(result) {
      register();
      return result;
    });
  }
  else {
    register();
  }
  
  return output;
};

var report = function() {
  var files = [];
  
  Object.keys(data).forEach(function(file) {
    var items = [];
    Object.keys(data[file]).forEach(function(position) {
      var sum = 0, count = data[file][position].length, mean, variance = 0, stddev;
      var timings = data[file][position];
      timings.forEach(function(timing) {
        sum += timing;
      });
      mean = sum / count;
      timings.forEach(function(timing) {
        variance += Math.pow(Math.abs(timing - mean), 2);
      });
      stddev = Math.sqrt(variance);
      var toInt = function(v) {
        return parseInt(v);
      };
      var item = position.split(':').map(toInt);
      item.push(Math.round(mean));
      item.push(Math.round(stddev));
      item.push(Math.min.apply(this, timings.map(toInt).slice(0,64)));
      item.push(Math.max.apply(this, timings.map(toInt).slice(0,64)));
      item.push(count);
      items.push(item);
    });
    items.sort(function(a, b) {
      for (var i = 0; i < 4; ++i) {
        var d = a[i] - b[i];
        if (d !== 0) {
          return d;
        }
      }
      return 0;
    });
    files.push({
      name: file,
      lines: fs.readFileSync(pwd + file).toString().split("\n"),
      data: items
    });
    files.sort(function(a,b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  });
  
  return files;
};

module.exports = function(runner) {
  runner.on('end', function() {
    var html = fs.readFileSync('./template.html').toString().split('/* data */');
    html = html[0] + JSON.stringify(report()) + html[2];
    console.log(html);
  });
};

global.rapidityWrap = wrap;
