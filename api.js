// This class defines the API to fetch NGA data.

const rp = require('request-promise');
const iconv = require('iconv-lite');
const _ = require('lodash');

const headers = {
  // TODO can we automate the cookie generation process?
  'Cookie': 'onlineTotal=29907; guestJs=1462112719; lastvisit=1462112722; lastpath=/thread.php?fid=-7&rand=68; bbsmisccookies=%7B%22insad_refreshid%22%3A%7B0%3A%22/137e1156471790b2c5fe2e97ffa3%22%2C1%3A1462542146%7D%7D; CNZZDATA30043604=cnzz_eid%3D889559101-1455634868-http%253A%252F%252Fbbs.ngacn.cc%252F%26ntime%3D1462109398; CNZZDATA30039253=cnzz_eid%3D662217352-1455632342-http%253A%252F%252Fbbs.ngacn.cc%252F%26ntime%3D1462110718; CNZZDATA1256638820=1687625913-1455636149-http%253A%252F%252Fbbs.bigccq.cn%252F%7C1462109671; __utmt=1; __utma=215976260.557996419.1455636916.1462100170.1462111879.10; __utmb=215976260.2.10.1462111879; __utmc=215976260; __utmz=215976260.1457956181.7.5.utmcsr=bbs.ngacn.cc|utmccn=(referral)|utmcmd=referral|utmcct=/thread.php; _i=bxkNjT%2B1L%2FEsBG9XHNPoZzqcN5bxt%2FgBl85mRV%2BnqZFngM6i%2FxSj0Q%3D%3D_7be2b75b1bb64d892dd3ac6c43b9f242_1462026402; ngacn0comUserInfo=hisenser%09hisenser%0939%0939%09%0918%092487%091%090%090%096_75%2C19_-300; ngacn0comUserInfoCheck=a684b9c2fd3ed8201f832c5b77f8514e; ngacn0comInfoCheckTime=1462112807; ngaPassportUid=355438; ngaPassportUrlencodedUname=hisenser; ngaPassportCid=ec84c2362517458833e2ef438a10ac4e4f58ea4a'
};

/**
 * Read threads of big CCQ
 */
async function readCcqThreads({ fid = -7, depth = 5 } = {}) {
  const uri = `http://bbs.bigccq.cn/thread.php?fid=${fid}`;
  return _fetchData({ uri, pages: depth, dataKey: '__T' });
}

/**
 * Read replies of a thread
 */
function readThreadReplies(thread) {
  const tid = thread.tid;
  const pages = Math.ceil(thread.replies / 20); // TODO better use __R__ROWS_PAGE instead of magic number

  const uri = `http://bbs.bigccq.cn/read.php?tid=${tid}`;
  return _fetchData({ uri, pages, dataKey: '__R' });
}

/**
 * Fetch data at URI
 */
async function _fetchData({ uri, pages, dataKey }) {
  const requests = [];

  // Read pages parallally
  for (let i = 1; i <= pages; i ++ ) {
    requests.push(rp({
      uri: `${uri}&lite=js&page=${i}`,
      headers,
      encoding: null
    }));
  }

  const bodies = await Promise.all(requests);

  // Decode each page and merge them into a single array
  const pieces = _.flatten(bodies.map(body => {
    const decodedBody = decodeResponseBody(body).data[dataKey];
    return Object.entries(decodedBody).map(([index, piece]) => piece);
  }));

  return pieces;
}

/**
 * Decode response body.
 */
function decodeResponseBody(body) {
  // Since NGA using GBK encoding and not by default supported by Node,
  // need to decode using iconv
  const buffer = Buffer.from(body);
  const decodedBody = iconv.decode(buffer, 'GBK');

  // Format: http://bbs.ngacn.cc/read.php?tid=6406100
  const window = {};
  eval(decodedBody);

  return window.script_muti_get_var_store;
}

module.exports = {
  readCcqThreads,
  readThreadReplies
}
