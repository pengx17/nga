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

/**
 * Find 树洞 threads
 */
async function getShudongThreads() {
  const threads = await readCcqThreads({ depth: 10 });
  const filteredThreads = threads.filter(thread => thread.subject.indexOf('树洞') !== -1);
  return filteredThreads;
}

getShudongThreads().then((threads) => {
  threads = threads.forEach(async(thread) => {
    const replies = await readThreadReplies(thread);
    const replyContents = replies.map(reply => reply.content);

    console.log(`
tid: ${thread.tid} subject: ${thread.subject}
${replyContents.join('\n\t')}`);
  });
});
