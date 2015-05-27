/**
 * AIME-admin Data Fetching
 * =========================
 *
 * Data fecthing logic. Act upon Baobab's get events to assess when data
 * must be retrieved from the API.
 */
function compare(a1, a2) {
  if (a1.length !== a2.length)
    return;

  for (let i = 0, l = a1.length; i < l; i++) {
    if (a1[i] !== a2[i])
      return false;
  }

  return true;
}

// TODO: code an abstraction over this
// TODO: code a service lock to avoid stupidities
// TODO: don't access API if not logged
export default function(tree) {

  tree.on('get', function({data: {path, data}}) {
    if (!data && compare(path, ['data', 'book']))
      tree.client.book();
    if (!data && compare(path, ['data', 'vocabulary']))
      tree.client.vocabulary();
    if (!data && compare(path, ['data', 'documents']))
      tree.client.documents();
  });
};
