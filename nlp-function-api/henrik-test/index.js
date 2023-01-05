module.exports = async function (context, req, document) {

  const res = {
    // status: 200, /* Defaults to 200 */
    body: "HELLO WORLD",
  }
  context.res = res;
};
