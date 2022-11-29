var fs = require("fs");
var Handlebars = require("handlebars");
var parseISO = require('date-fns/parseISO')
var format = require('date-fns/format')
var sass = require('sass');
var marked = require('marked');

function render(resume) {
    // Load css and template
    var css = sass.compile(__dirname + "/css/style.scss");
    var template = fs.readFileSync(__dirname + "/resume.handlebars", "utf-8");
    // Load print-specific css
    var print = fs.readFileSync(__dirname + "/css/print.css", "utf-8");

    // Register custom handlebars extensions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // foreach loops //
    // http://stackoverflow.com/a/12002281/1263876
    Handlebars.registerHelper("foreach",function(arr,options) {
        if(options.inverse && !arr.length)
            return options.inverse(this);

        return arr.map(function(item,index) {
            item.$index = index;
            item.$first = index === 0;
            item.$notfirst = index !== 0;
            item.$last  = index === arr.length-1;
            return options.fn(item);
        }).join('');
    });
    // Logic operators //
    // http://stackoverflow.com/a/16315366
    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });
    // comma separated lists //
    // http://stackoverflow.com/a/18831911
    Handlebars.registerHelper('commalist', function(items, options) {
        return options.fn(items.join(', '));
    });

    Handlebars.registerHelper("formatDate", function(dateStr) {
        return format(parseISO(dateStr), "MMMM yyyy")
    })

    Handlebars.registerHelper("markdown", function(str) {
        return new Handlebars.SafeString(marked.parseInline(str));
    })
    // Compile
    return Handlebars.compile(template)({
        css: css.css,
        print: print,
        resume: resume
    });
}

module.exports = {
    render: render
};
