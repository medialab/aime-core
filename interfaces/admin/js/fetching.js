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

export default function(tree) {

  tree.on('get', function({data: {path, data}}) {
    console.log(path, data);
    if (compare(path, ['data', 'book']) && !data)
      tree.client.book();
  });
};
