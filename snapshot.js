
var fs = require("fs")
,   pth = require("path")
,   tmp = require("tmp")
,   exec = require("child_process").exec
,   rfs = function (f) { return fs.readFileSync(f, { encoding: "utf8" }); }
,   wfs = function (f, data) { return fs.writeFileSync(f, data, { encoding: "utf8" }); }
,   rel = function (f) { return pth.join(__dirname, f); }
,   error = function (e) { console.error(e); process.exit(1); }
,   runRSFile = rel("run-respec.phjs")
,   localFile = rel("local-config.json") // use this file to override the config
,   localConfig = fs.existsSync(localFile) ? JSON.parse(rfs(localFile)) : {}
,   outputFile = rel(process.argv[2] || localConfig.output || "index.html")
,   respecConfig = {
        specStatus:     "ED"
    ,   shortName:      "url"
    ,   noReSpecCSS:    true
    ,   bugTracker: {
            "new":  "https://www.w3.org/Bugs/Public/enter_bug.cgi?product=WHATWG&component=URL"
        ,   open:   "https://www.w3.org/Bugs/Public/buglist.cgi?product=WHATWG&component=URL&resolution=---"
        }
    ,   editors:        [
                            { name: "Anne van Kesteren", url: "http://annevankesteren.nl/",
                              company: "Mozilla", companyURL: "http://www.mozilla.org/",
                              email: "annevk@annevk.nl", note: "Upstream WHATWG version" }
                        ,   { name: "Dan Appelquist",
                              company: "Telefónica", companyURL: "http://telefonica.com/",
                              email: "daniel.appelquist@telefonica.com" }
                        ]
    ,   wg:             "Technical Architecture Group"
    ,   wgURI:          "http://www.w3.org/2001/tag/"
    ,   wgPublicList:   "www-tag"
    ,   wgPatentURI:    "XXX FIX ME XXX"
    ,   edDraftURI:     "http://w3ctag.github.io/url/"
    ,   license:        "cc-by"
    }
;


// // make a document that can generate nice headers
for (var k in localConfig) respecConfig[k] = localConfig[k];
var respecSource = rfs(rel("header-maker.html"))
                        .replace("###CONFIG###", JSON.stringify(respecConfig, null, 4))
;

tmp.file({ postfix: ".html" }, function (err, path) {
    if (err) error(err);
    wfs(path, respecSource);
    exec("phantomjs " + runRSFile + " " + path, function (err, stdout, stderr) {
        if (err) throw "Error running PhantomJS script: " + (stderr || err || "unknown error");
        var data = JSON.parse(stdout)
        ,   domSrc = rfs("url.html")
                        .replace(/<meta charset[^]*?<div/im, "<head>\n" + data.head + "\n</head>\n<div")
                        .replace(/<div class="head">[^]*?<\/div>/im, "<div class='head'>" + data.divHead + "</div>")
                        .replace(/<script[^]*?<\/script>/mig, "")
                        .replace(/(<h2[^><]+id="table-of-contents)/i, data.sotd + "\n\n" + "$1")
        ;

        // XXX do your own processing here
        
        console.log("Writing " + outputFile);
        wfs(outputFile, domSrc);
    });
});
