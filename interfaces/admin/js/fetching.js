/**
 * AIME-admin Data Fetching
 * =========================
 *
 * Data fecthing logic. Act upon Baobab's get events to assess when data
 * must be retrieved from the API.
 */
function compare(a1, a2) {
  for (let i = 0, l = a2.length; i < l; i++) {
    if (!a1[i] || a1[i] !== a2[i])
      return false;
  }

  return true;
}

// TODO: code an abstraction over this
// TODO: code a service lock to avoid stupidities
// TODO: don't access API if not logged
export default function(tree) {

  let loaded = false;

  tree.on('get', function({data: {path, data}}) {

    if (loaded) return
    if (!data && compare(path, ['data'])) {
      tree.client.book();
      tree.client.voc();
      tree.client.doc();
      tree.client.res();
      tree.client.users();
      tree.client.ref();
      loaded = true;
    }

  });
};
