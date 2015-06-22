# An Inquiry into Modes of Existence

This repository holds the code driving the new core of the AIME project.

## Folder Structure

* `api` - API relevant files.
* `docs` - Miscellaneous documents such as the database schema.
* `interfaces` - The inquiry's user interfaces.
* `lib` - Generic files serving several purposes (migration notably).
* `scripts` - Core scripts such as migration.
* `test` - Unit testing files.

## Scripts

```bash
# Install dependencies
npm install

# edit config
cp config.example.json config.json

# Running a migration
npm run migrate
```

## Resources (external to this repository)

Not included in this repository for obvious reasons.

* Internal medias (images, pdfs etc.)
* NovelPro fonts

## update code in a test server
How to update an install on a server with new code version ?

### first update the source code
```bash
git pull
```
### restart the api
```bash
pm2 list
>>>
┌──────────┬────┬──────┬───────┬────────┬─────────┬────────┬──────────────┬──────────┐
│ App name │ id │ mode │ pid   │ status │ restart │ uptime │ memory       │ watching │
├──────────┼────┼──────┼───────┼────────┼─────────┼────────┼──────────────┼──────────┤
│ api      │ 0  │ fork │ 14514 │ online │ 0       │ 50D    │ 147.656 MB   │ disabled │
└──────────┴────┴──────┴───────┴────────┴─────────┴────────┴──────────────┴──────────┘

pm2 restart 0
>>>
┌──────────┬────┬──────┬───────┬────────┬─────────┬────────┬─────────────┬──────────┐
│ App name │ id │ mode │ pid   │ status │ restart │ uptime │ memory      │ watching │
├──────────┼────┼──────┼───────┼────────┼─────────┼────────┼─────────────┼──────────┤
│ api      │ 0  │ fork │ 21744 │ online │ 1       │ 0s     │ 15.566 MB   │ disabled │
└──────────┴────┴──────┴───────┴────────┴─────────┴────────┴─────────────┴──────────┘
```
### compile inquiry javascript
```bash
cd interface/inquiry
./node_modules/.bin/gulp
>>>
[11:08:49] Using gulpfile /var/opt/aime-core/interfaces/inquiry/gulpfile.js
[11:08:49] Starting 'style'...
[11:08:49] Starting 'templates'...
[11:08:50] Finished 'style' after 1 s
[11:08:52] Finished 'templates' after 3.61 s
[11:08:52] Starting 'default'...
[11:08:52] Finished 'default' after 27 μs
```
### compile crossings javascript
```bash
cd interfaces/crossings
grunt dev
>>>
Running "ngconstant:development" (ngconstant) task
Creating module config at app/js/config.js...OK

Done, without errors.
```

## new clean data migration

### stop neo4j
```bash
sudo service neo4j stop
```
### empty neo4j data
rm everyfile in the neo4j data folder

### restart neo4j
```bash
sudo service neo4j start
```

### migrate
```bash
npm run migrate
>>>
Truncating neo4j target...
Deleted 0 items in the neo4j target.
Saving 1891 book items...
##Saving contributions...
Saving 599 internal files...
Saving 2055 external files...
Saving document items...
Saving 6369 users...
Saving 310 vocabulary items...
Saving modes and crossings...
{ id: 1400241386815, type: 'contribution' } [ 'cont_1400241386815',
  'voc_741',
  'bsc_39317',
  'bsc_39329',
  'voc_1801' ]
Saving scenarii...
Saving links (lost 7 items)...
Saving bookmarks...
Creating harmony...
Computing references...
Creating slugs...
Saving user bookmarks...
Computing markdown...
Cleaning up...
Done!
```
