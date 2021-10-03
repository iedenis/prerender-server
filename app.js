var createError = require('http-errors');
var express = require('express');
var app = express();
var path = require('path');
require('dotenv').config();
const bodyParser = require('body-parser');
// const server = require('./../prerender/lib/server');
const puppeteer = require('puppeteer');
const ssr = require('./ssr/ssr');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const prerender = require('./pagesCaching/prerender/lib/index');
const os = require('os');
const crawlers = require('crawler-user-agents');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// server.use(require('prerender-memory-cache'));
// server.use(require('prerender-file-cache'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.use(middleware);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

let isBot = false;
app.use('*', async function (req, res, next) {
  // const server = require('./pagesCaching/prerender/lib/server');

  var botPattern =
    '(googlebot/|bot|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis)';
  var re = new RegExp(botPattern, 'i');
  var userAgent = req.headers['user-agent'];
  isBot = re.test(userAgent);
  if (isBot) {
    console.log('CRAWLER');

    const url = 'https://www.we4rent.com/ru';
    let browserWSEndpoint = null;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox','--disable-setuid-sandbox']
    });
    browserWSEndpoint = await browser.wsEndpoint();
    const { html, status } = await ssr(url, browserWSEndpoint);
    return res.status(200).send(html);
    // const server = require('./../prerender/lib/server');
    // server.init();
    // server.onRequest = server.onRequest.bind(server);

    // app.disable('x-powered-by');
    // app.use(require('compression')());
    // server.use(require('./pagesCaching/pagesCaching'));

    // server.start();
    // server.onRequest(req, res);

    // app.post('*', bodyParser.json({ type: () => true }), server.onRequest);
  } else {
    console.log('not crawler');
    next();
  }
});
app.get('*', function (req, res) {
  return res.status(200).json({ message: 'not a crawler' });
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log('ERROR');
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
