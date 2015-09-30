# An Inquiry into Modes of Existence

This repository holds the source code driving the new core of the AIME project.

*This project has been built for a research project which has received funding from the European Research Council under the European Union’s Seventh Framework Programme (FP7/2007-2013) / ERC Grant ‘IDEAS’ 2010 n° 269567”.*

It mainly consist of a centralized data model stored within a Neo4j database and served through a single API server written in node.

Once the API is online, each one of the three AIME interfaces (`inquiry`, `crossings` and `admin`) will plug itself on it to function.



## Installation

### API

#### Mounting the server

First you need to clone this repository and enter the resultant folder.

```bash
git clone git+https://github.com/medialab/aime-core.git
cd aime-core
```

Install the node dependencies:

```bash
npm install
```

Then you need to copy the `config.example.json` file and edit it to adjust the API to your settings.

```bash
cp config.example.json config.json
vim config.json
```

#### Importing external elements

Some elements are external to this repository and must be included if you want the interfaces to work correctly:

**Fonts**

The NovelPro fonts must be included in the three interfaces here:

* `interfaces/inquiry/fonts`
* `interfaces/crossings/app/fonts`
* `interfaces/admin/fonts`

**Media**

Both pdfs and images must be put in a `resources` folder at the root of the folder. (You can alternatively change this path through the `api.resources` settings in `config.json`).

#### Migrating the database (or importing the data from an existing instance)

To build the harmonized Neo4j database, you need to migrate data from both the inquiry MySQL one and the crossings Mongo one.

To do so, be sure your `config.json` is correctly set and run the following command (it will take ~5min so be patient):

```bash
npm run migrate
```

#### Installing the interfaces dependencies

**Inquiry**

Be sure to have `gulp` installed globally:

```bash
(sudo) npm install -g gulp
```

Go into `interfaces/inquiry` and run `npm install`.

Then copy the config file and edit it to fit your needs:

```bash
cp config.example.js config.js
vim config.js
```

**Crossings**

Be sure to have both `grunt` and `bower` installed globally:

```bash
(sudo) npm install -g grunt grunt-cli bower
```

Install both `npm` and `bower` dependencies

```bash
npm install && bower install
```

Then copy the config file and edit it to fit your needs:

```bash
cp config.example.json config.json
vim config.json
```

**Admin**

```bash
npm install
```

Then copy the config file and edit it to fit your needs:

```bash
cp config.example.json config.json
vim config.json
```

**blog**

See our ghost fork [poltergeist](https://github.com/medialab/ghost/tree/poltergeist).

### Installing Biblib

Follow the instructions [here](https://github.com/medialab/reference_manager) and import the data from an existing corpus.

## Usage

### Running the API server

```bash
npm start
```

### Running the interfaces

Enter the relevant interface into the `interfaces` folder and use:

```bash
npm start
```

### Long term running

We currently use the [`pm2`](https://github.com/Unitech/pm2) npm package to run the API server while serving the interfaces through Apache. But you are free to use whatever fits your needs.

Don't forget to pass the `harmony` flag to node (required by the [`essence`](https://github.com/essence/essence.js/tree/master) library) in order to be able to run the API server:


```bash
pm2 start --node-args='--harmony' ./scripts/start.js
```

## Misc information

### Folder Structure

* `api` - The node/express API files.
* `docs` - Miscellaneous documents such as the database schema.
* `interfaces` - The inquiry's user interfaces.
* `lib` - Generic files serving several purposes (migration notably).
* `scripts` - Core scripts such as migration.
* `test` - Unit testing files.

### Scripts

*Updating Biblib information*

```bash
npm run biblib
```

*Running the unit tests*

```bash
npm test
```

## License

* LGPL-v3
* CECILL-C
