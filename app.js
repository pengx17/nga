const _ = require('lodash');
const {
  readThreadReplies,
  readCcqThreads
} = require('./api');

/**
 * Fetch threads with no replies
 */
async function getNoReplyThreads() {
  const threads = await readCcqThreads();
  const noReplyThreads = threads.filter(thread => thread.replies === 0);

  return noReplyThreads;
}

setInterval(() => {
  getNoReplyThreads().then((threads) => {
    threads = threads.forEach(async(thread) => {
      const replies = await readThreadReplies(thread.tid);
      const replyContents = replies.map(reply => 'uid ' + reply.authorid + ': ' + reply.content);

      console.log(`
tid: ${thread.tid} subject: ${thread.subject}
  ${replyContents.join('\n')}
      `);
    });
  });
}, 2000);
