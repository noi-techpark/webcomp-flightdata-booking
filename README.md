<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: CC0-1.0
-->

# Flightdata Booking

[![REUSE Compliance](https://github.com/noi-techpark/webcomp-flightdata/actions/workflows/reuse.yml/badge.svg)](https://github.com/noi-techpark/odh-docs/wiki/REUSE#badges)
[![REUSE status](https://api.reuse.software/badge/github.com/noi-techpark/webcomp-flightdata)](https://api.reuse.software/info/github.com/noi-techpark/webcomp-flightdata)

A customizable map for displaying air traffic in and around BZO/Bolzano. Real-time data can be retrieved and displayed via websockets. 

## Table of contents

- [Usage](#usage)
- [Gettings started](#getting-started)
- [Tests and linting](#tests-and-linting)
- [Deployment](#deployment)
- [Docker environment](#docker-environment)
- [Information](#information)

## Usage

Include vue.js (https://unpkg.com/vue) and the webcompscript file `dist/noi-flightdata-booking.min.js` in your HTML and define the web component like this:

```html
<noi-flightdata-booking theme="OpenDataHub"
                        langPack='{ "es" : { "periods": {  "day": "By days", "week": "By weeks"  } } }'
                        id="fligtdata-booking"
                        styleurl=""
                        language="en"
                        timezone="Europe/Berlin"
                        maxforecast="10">
</noi-flightdata-booking>
```
For a full example, configuration and filter options and available custom properties please have a look at [the demo](demo.html).

### Attributes

#### language

The language in which the component is rendered

Type: string<br>
Options: "en", "it", "de"

Translations can be changed or added via the langPack attribute: [the demo](demo.html)

#### theme

This attribute can be used to apply a predefined set of colors.

Type: string<br>
Options: "OpenDataHub", "skyalps"

#### styleurl

you can specify a url from an external stylesheet (css). This stylesheet will then be appended to the shadowroot and thus allows overriding most css rules.
If this option is used, an id must be assigned to the element.


#### timezone

timezone for arrivals/departures

Type: Timezone name (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)<br>
Default: UTC

#### maxforecast

Maximum flights entries to be shown for departure and arrival 

Type: Number<br>
Default: 5

#### colors

Main webcomponent colors. A full customization in colors can be made by using a custom css via styleUrl attribute.

Type: Object<br>
Default:
```
{
    --noi-primary: white;
    --noi-mid: #f5f5f5;
    --noi-secondary: black;
    --noi-text-primary: black;
    --noi-text-secondary: white;
    --noi-light-bg: #F5F4F6;
    --noi-font-family: 'Barlow Semi Condensed';
    --basic-font-size: 16px;
}
```

## Getting started

These instructions will get you a copy of the project up and running
on your local machine for development and testing purposes.

### Prerequisites

To build the project, the following prerequisites must be met:

- Node 17 / NPM 8

For a ready to use Docker environment with all prerequisites already installed and prepared, you can check out the [Docker environment](#docker-environment) section.

### Source code

Get a copy of the repository:

```bash
git clone https://github.com/noi-techpark/webcomp-flightdata-booking
```

Change directory:

```bash
cd webcomp-flightdata-booking/
```

### Dependencies

Download all dependencies:

```bash
npm install
```

### Develope/Build

Build the project:

```bash
npm start
```

The necessary files to run the web component are provided under dist/.
dist/demo.html can be viewed locally in your browser.

## Deployment

To create the distributable files, execute the following command:

```bash
npm run build
```

## Docker environment

For the project a Docker environment is already prepared and ready to use with all necessary prerequisites.

These Docker containers are the same as used by the continuous integration servers.

### Installation

Install [Docker](https://docs.docker.com/install/) (with Docker Compose) locally on your machine.

### Dependenices

First, install all dependencies:

```bash
docker-compose run --rm app /bin/bash -c "npm install"
```

### Start and stop the containers

Before start working you have to start the Docker containers:

```
docker-compose up --build --detach
```

After finished working you can stop the Docker containers:

```
docker-compose stop
```

### Running commands inside the container

When the containers are running, you can execute any command inside the environment. Just replace the dots `...` in the following example with the command you wish to execute:

```bash
docker-compose run --rm app /bin/bash -c "..."
```

Some examples are:

```bash
docker-compose run --rm app /bin/bash -c "npm run test"
```

## Information

### License

The code in this project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3 license. See the [LICENSE.md](LICENSE.md) file for more information.

### REUSE

This project is [REUSE](https://reuse.software) compliant, more information about the usage of REUSE in NOI Techpark repositories can be found [here](https://github.com/noi-techpark/odh-docs/wiki/Guidelines-for-developers-and-licenses#guidelines-for-contributors-and-new-developers).

Since the CI for this project checks for REUSE compliance you might find it useful to use a pre-commit hook checking for REUSE compliance locally. The [pre-commit-config](.pre-commit-config.yaml) file in the repository root is already configured to check for REUSE compliance with help of the [pre-commit](https://pre-commit.com) tool.

Install the tool by running:
```bash
pip install pre-commit
```
Then install the pre-commit hook via the config file by running:
```bash
pre-commit install
```

