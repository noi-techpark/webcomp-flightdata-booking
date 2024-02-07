<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div :class="'noi-flightdata-booking global ' + device + ' ' + options.theme" v-show="options" ref="viewport" style="width: 100%;  position: relative;"> <!-- height: 100%; min-height:200px; -->
    <div class="container-fluid">
        <div v-if="!isMobile || !showResults" class="row noi-top-bar">
            <div class="col">
                <img v-if="options.theme == 'skyalps'" src="https://third-party.opendatahub.com/webcomp-flightdata-realtime/src/assets/icons/skyalpsl-full-alt-trasp.png" />
                <img v-else src="https://third-party.opendatahub.com/opendatahub-logo/OpenDataHub-Logo-Black-nospace-01.svg" />
            </div>
        </div>
        <div v-else class="row noi-top-bar trip">
            <div class="col">
                <div @click="stepBack()">
                    <Icon class="noi-top-back-icon" icon="ep:arrow-left"/>
                </div>
                <img v-if="options.theme == 'skyalps'" :src="require('@/assets/icons/plane-big-blue.png')" height="24px" :class="{rotate:currentMobileStep == 1}"/>
                <img v-else :src="require('@/assets/icons/plane-big-black.png')" height="24px" :class="{rotate:currentMobileStep == 1}"/>
                {{ getMobileStepTitle }}
            </div>
        </div>
        <div class="row noi-description-bar" v-if="!showResults">
            <div class="col">
                <h2>{{ $t("header.title") }}</h2>
                <p>{{ $t("header.description") }}</p>
            </div>
        </div>
    </div>

    <!-- search container -->
    <form @submit.prevent="search"  autocomplete="off">
        <div class="container-xl noi-search-fields-container" v-if="!showResults">

            <div class="row noi-trip-type-container">
                <div class="col text-left">
                    <input  v-model="roundTripCheck" type="radio" name="roundTripCheck" value="1" placeholder="Round trip" /> {{ $t("searchBar.roundTrip") }}
                    <input v-model="roundTripCheck" type="radio" name="roundTripCheck" value="0" placeholder="One way" /> {{ $t("searchBar.oneWay") }}
                </div>
            </div>

            <div class="row text-center">
                <div class="noi-col-5 noi-col-mob-12">
                    <div class="row" style="position:relative;">
                        <div class="noi-col-6 noi-col-mob-12">
                            <airports-dropdown
                                ref="departureAirportSelector" 
                                @clicked="onDepartureAirportSelect" 
                                :initValue="departureAirport"
                                :clusters="sortedAirportsClusters" 
                                name="departureAirportPicker" 
                                :placeholder="$t('DepartureAirport')">
                            </airports-dropdown>
                        </div>
                        
                        <div class="noi-swap-icon" @click="swapAirports()">
                            <img v-if="options.theme == 'skyalps'" :src="require('@/assets/icons/change-airports-order-icon-blue.svg')" />
                            <img v-else :src="require('@/assets/icons/change-airports-order-icon.svg')" />
                        </div>
                        
                        <div class="noi-col-6 noi-col-mob-12">
                            <airports-dropdown 
                                ref="arrivalAirportSelector" 
                                @clicked="onArrivalAirportSelect" 
                                :initValue="arrivalAirport"
                                :clusters="sortedAirportsClusters" 
                                name="arrivalAirportPicker" 
                                :placeholder="$t('DestinationAirport')">
                            </airports-dropdown>
                        </div>
                    </div>
                </div>

                <div class="noi-col-7 noi-col-mob-12">
                    <div class="row">
                        <div class="noi-col-4 noi-col-mob-12" >
                            <div style="position: relative;">
                                <!-- ref="datepicker" -->
                                <date-picker 
                                    :append-to-body="false"
                                    timeTitleFormat="MM"
                                    :editable="false"
                                    :confirm="false"
                                    @pick="handlePickDate"
                                    @open="handleOpenPopupEvent"
                                    @close="handleClosePopupEvent"
                                    :disabled-date="disabledRangeHandler"
                                    v-model="rangeDate" 
                                    format="DD MMM YY"
                                    valueType="date"
                                    range-separator=" - "
                                    key="1" 
                                    :input-attr="{class:'form-control noi-datepicker-input ',id:'rangeDatePicker',name:'rangeDatePicker'}"  
                                    :range="isRoundTrip"
                                >
                                </date-picker>
                                <span class="noi-input-label" :class="{ focused: datePickerLabelFocused }">{{ $t("RangeDates") }}</span>
                            </div>
                        </div>
                        <div class="noi-col-4 noi-col-mob-12">
                            <passengers-dropdown 
                                @clicked="onPassengersSelect" 
                                name="departureAirportPicker" 
                                :placeholder="$t('Passengers')">
                            </passengers-dropdown>
                        </div>
    
                        <div class="noi-col-4 noi-col-mob-12">
                            <input type="submit" class="button dark" value="Search flights" :class="{disabled: !isFormValid()}" />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </form>

    
    <!-- results container -->
    <div class="noi-results" v-if="showResults" :class="{'container-xl': !isMobile}">
        
        <!-- top summary -->
        <div class="noi-results-top-summary" v-if="!isMobile">
            <div class="title">
                <span>{{ $t("from") }} {{ departureAirport.label }} {{ $t("to") }} {{ arrivalAirport.label }}</span>
                <div @click="changeSearch()" >
                    <Icon icon="prime:pencil"/>
                </div>
            </div>
            <span class="subtitle">{{ getSearchSubtitle() }}</span> 
        </div>
    

        <!-- outward flights -->
        <div class="noi-results-flights" v-if="!isMobile || currentMobileStep == 0">
            <div class="title" v-if="!isMobile">
                <Icon icon="el:plane"/> <span>{{ $t("flightTo") }} {{ arrivalAirport.label }}</span>
            </div>
            
            <!-- top calendar bar -->
            <div class="navigator">
                <div class="container-flex">
                    <div class="horizontal-calendar">
                        <hooper 
                            ref="outwardHooper"
                            :itemsToShow="getHooperItemsToShow" 
                            :centerMode="true"
                            :wheelControl="false"
                            :initialSlide="getTimeInterval">
                                <slide v-for="el in outwardCalendarElements" :key="el.key" class="horizontal-calendar-element" :class="{selected: isOutwardCalendarElementSelected(el), disabled:isOutwardCalendarElementDisabled(el)}">
                                    <div @click="handleOutwardCalendarElementClick(el)" >
                                        {{ getLowestAvailablePrice('outward',el.key) }}
                                        <span>{{ el.subLabel }}</span> 
                                    </div>
                                </slide>
                            <hooper-navigation slot="hooper-addons" class="lg-only"></hooper-navigation>
                        </hooper>
                    </div>
                </div>
            </div>

            <!-- loader -->
            <div class="noi-loader-results-container" v-if="loadingResults">
                <div class="text-center">
                    <div class="placeholder-content">
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item" v-if="!isMobile"></div>
                        <div class="placeholder-content_item" v-if="!isMobile"></div>
                        <div class="placeholder-content_item" v-if="!isMobile"></div>
                        <div class="placeholder-content_item" v-if="!isMobile"></div>
                    </div>
                </div>
            </div>
            <!-- results -->
            <div v-else>
                <div class="container-flex noi-flights-results-list" v-if="lastOutwardFlights.length > 0">
                    <div class="row noi-flights-results-row" v-for="flight in lastOutwardFlights" :key="flight.key" :class="flight.flightInfo['colorClass']" >
                        
                        <!-- desktop -->
                        <div class="col-lg-2 noi-flight-row-logo lg-only">
                            <img src="https://third-party.opendatahub.com/webcomp-flightdata-realtime/src/assets/icons/skyalpsl-full-alt-trasp.png" />
                            <br/>
                            <!-- <span>Operated by SkyAlps</span> -->
                        </div>
                        
                        <div class="col-lg-7 lg-only">
                            <div class="row">
                                <div class="col-lg-3 noi-flight-row-airport departure">
                                    <div class="hour">{{ asZoneTime(flight.departure.time) }}</div>
                                    <div><div class="noi-flight-row-badge">{{ flight.departure.airport.iataCode }}</div> <span>{{ flight.departure.airport.name }}</span></div><br/>
                                </div>
                                <div class="col-lg-6 noi-flight-row-path">
                                    <span>{{ getShownTime(flight) }}</span>
                                    <div class="noi-flight-row-plane-line" :class="flight.flightInfo['planeLineClass']">
                                        <div class="before"></div>
                                        <div class="plane">
                                            <Icon icon="material-symbols:flight" rotate="90deg" />
                                        </div>
                                        <div class="after"></div>
                                    </div>
                                    <span class="type">{{ $t("direct") }}</span>
                                </div>
                                <div class="col-lg-3 noi-flight-row-airport arrival">
                                    <div class="hour">{{ asZoneTime(flight.arrival.time) }}</div>
                                    <div><div class="noi-flight-row-badge">{{ flight.arrival.airport.iataCode }}</div> <span>{{ flight.arrival.airport.name }}</span></div><br/>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 noi-flight-row-button lg-only">
                            <div @click="selectFlight('outward',flight)" class="button" :class="{selected: selectedFlights['outward'] == flight}">
                                {{ getFormattedFlightRate(flight) }}
                            </div>
                        </div>


                        <!-- mobile -->
                        <div class="col sm-only">
                            <div class="row">
                                <div class="col-3 noi-flight-row-airport departure">
                                    <div class="hour">{{ asZoneTime(flight.departure.time) }}</div>
                                    <div><span>{{ flight.departure.airport.name }}<br/>({{ flight.departure.airport.iataCode }})</span></div><br/>    
                                </div>
                                <div class="col-6 p-0">
                                    <div class="noi-flight-row-path">
                                        <span>{{ getShownTime(flight) }}</span>
                                        <div class="noi-flight-row-plane-line" :class="flight.flightInfo['planeLineClass']">
                                            <div class="before"></div>
                                            <div class="plane">
                                                <Icon icon="material-symbols:flight" rotate="90deg" />
                                            </div>
                                            <div class="after"></div>
                                        </div>
                                        <span class="type">{{ $t("direct") }}</span>
                                    </div>
                                    <div class="noi-flight-row-logo">
                                        <img src="https://third-party.opendatahub.com/webcomp-flightdata-realtime/src/assets/icons/skyalpsl-full-alt-trasp.png" /> 
                                        <!-- <span>Operated by SkyAlps</span> -->
                                    </div>
                                </div>
                                <div class="col-3 noi-flight-row-airport arrival">
                                    <div class="hour">{{ asZoneTime(flight.arrival.time) }}</div>
                                    <div><span>{{ flight.arrival.airport.name }}<br/>({{ flight.arrival.airport.iataCode }})</span></div><br/>
                                </div> 
                            </div>
                            <div class="row">
                                <div class="col noi-flight-row-button">
                                    <div @click="selectFlight('outward',flight)" class="button" :class="{selected: selectedFlights['outward'] == flight}">
                                        {{ getFormattedFlightRate(flight) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div class="noi-flights-any-result">
                        <p><strong>{{ $t("anyResult.title") }}</strong></p>
                        <p>{{ $t("anyResult.description") }} <strong><u>{{ $t("anyResult.descriptionBold") }}</u></strong>.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- return flights -->
        <div class="noi-results-flights" v-if="roundTripCheck == '1' && (!isMobile || currentMobileStep == 1)">
            <div class="title" v-if="!isMobile">
                <Icon icon="el:plane" rotate="180deg" /> <span>{{ $t("flightTo") }} {{ departureAirport.label }}</span>
            </div>
            
            <!-- top calendar bar -->
            <div class="navigator">
                <div class="container-flex">
                    <div class="horizontal-calendar">
                        <hooper 
                            ref="returnHooper"
                            :itemsToShow="getHooperItemsToShow" 
                            :centerMode="true"
                            :wheelControl="false"
                            :initialSlide="getTimeInterval">
                                <slide v-for="el in returnCalendarElements" :key="el.key"  class="horizontal-calendar-element day" :class="{selected: isReturnCalendarElementSelected(el), disabled:isReturnCalendarElementDisabled(el)}">
                                    <div @click="handleReturnCalendarElementClick(el)" >
                                        {{ getLowestAvailablePrice('return',el.key) }} 
                                        <span>{{ el.subLabel }}</span>
                                    </div>
                                </slide>
                            <hooper-navigation slot="hooper-addons" class="lg-only"></hooper-navigation>
                        </hooper>
                    </div>
                </div>
            </div>


            <!-- loader -->
            <div class="noi-loader-results-container" v-if="loadingResults">
                <div class="text-center">
                    <div class="placeholder-content">
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item"></div>
                        <div class="placeholder-content_item" v-if="!isMobile"></div>
                        <div class="placeholder-content_item" v-if="!isMobile"></div>
                        <div class="placeholder-content_item" v-if="!isMobile"></div>
                        <div class="placeholder-content_item" v-if="!isMobile"></div>
                    </div>
                </div>
            </div>
            <!-- results -->
            <div v-else>
                <div class="container-flex noi-flights-results-list" v-if="lastReturnFlights.length > 0">
                    <div class="row noi-flights-results-row" v-for="flight in lastReturnFlights" :key="flight.key" :class="flight.flightInfo['colorClass']">
                        
                        <!-- desktop -->
                        <div class="col-lg-2 noi-flight-row-logo lg-only">
                            <img src="https://third-party.opendatahub.com/webcomp-flightdata-realtime/src/assets/icons/skyalpsl-full-alt-trasp.png" />
                            <br/>
                            <!-- <span>Operated by SkyAlps</span> -->
                        </div>
                        <div class="col-lg-7 lg-only">
                            <div class="row">
                                <div class="col-lg-3 noi-flight-row-airport departure">
                                    <div class="hour">{{ asZoneTime(flight.departure.time) }}</div>
                                    <div><div class="noi-flight-row-badge">{{ flight.departure.airport.iataCode }}</div> <span>{{ flight.departure.airport.name }}</span></div><br/>
                                </div>
                                <div class="col-lg-6 noi-flight-row-path">
                                    <span>{{ getShownTime(flight) }}</span>
                                    <div class="noi-flight-row-plane-line" :class="flight.flightInfo['planeLineClass']">
                                        <div class="before"></div>
                                        <div class="plane">
                                            <Icon icon="material-symbols:flight" rotate="90deg" />
                                        </div>
                                        <div class="after"></div>
                                    </div>
                                    <span class="type">{{ $t("direct") }}</span>
                                </div>
                                <div class="col-lg-3 noi-flight-row-airport arrival">
                                    <div class="hour">{{ asZoneTime(flight.arrival.time) }}</div>
                                    <div><div class="noi-flight-row-badge">{{ flight.arrival.airport.iataCode }}</div> <span>{{ flight.arrival.airport.name }}</span></div><br/>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 noi-flight-row-button lg-only">
                            <div @click="selectFlight('return',flight)" class="button" :class="{selected: selectedFlights['return'] == flight}">
                                {{ getFormattedFlightRate(flight) }}
                            </div>
                        </div>


                        <!-- mobile -->
                        <div class="col sm-only">
                            <div class="row">
                                <div class="col-3 noi-flight-row-airport departure">
                                    <div class="hour">{{ asZoneTime(flight.departure.time) }}</div>
                                    <div><span>{{ flight.departure.airport.name }}<br/>({{ flight.departure.airport.iataCode }})</span></div><br/>    
                                </div>
                                <div class="col-6 p-0">
                                    <div class="noi-flight-row-path">
                                        <span>{{ getShownTime(flight) }}</span>
                                        <div class="noi-flight-row-plane-line" :class="flight.flightInfo['planeLineClass']">
                                            <div class="before"></div>
                                            <div class="plane">
                                                <Icon icon="material-symbols:flight" rotate="90deg" />
                                            </div>
                                            <div class="after"></div>
                                        </div>
                                        <span class="type">{{ $t("direct") }}</span>
                                    </div>
                                    <div class="noi-flight-row-logo">
                                        <img src="https://third-party.opendatahub.com/webcomp-flightdata-realtime/src/assets/icons/skyalpsl-full-alt-trasp.png" /> 
                                        <!-- <span>Operated by SkyAlps</span> -->
                                    </div>
                                </div>
                                <div class="col-3 noi-flight-row-airport arrival">
                                    <div class="hour">{{ asZoneTime(flight.arrival.time) }}</div>
                                    <div><span>{{ flight.arrival.airport.name }}<br/>({{ flight.arrival.airport.iataCode }})</span></div><br/>
                                </div> 
                            </div>
                            <div class="row">
                                <div class="col noi-flight-row-button">
                                    <div @click="selectFlight('return',flight)" class="button" :class="{selected: selectedFlights['return'] == flight}">
                                        {{ getFormattedFlightRate(flight) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div class="noi-flights-any-result">
                        <p><strong>{{ $t("anyResult.title") }}</strong></p>
                        <p>{{ $t("anyResult.description") }} <strong><u>{{ $t("anyResult.descriptionBold") }}</u></strong>.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- desktop -->
    <div class="container-fluid noi-selection-bar" v-if="showResults && !isMobile" :class="{oneway:!isRoundTrip}" >
        <div class="row main-row justify-content-lg-center">
            <div class="col">
                <div class="container">
                    <div class="row">
                        <!-- flights details -->
                        <div class="col">
                            <div class="selection" :class="{selected: selectedFlights.outward}">
                                <div v-if="!selectedFlights.outward">
                                    <span v-if="isRoundTrip">{{ $t("selectFirstFlight") }}</span>
                                    <span v-else>{{ $t("selectFlight") }}</span>
                                </div>
                                <div v-else>
                                    <div class="plane">
                                        <Icon icon="el:plane" />
                                    </div>
                                    <div class="description">
                                        <span class="title">{{ $t("from") }} {{ selectedFlights.outward.departure.airport.name }} {{ $t("to") }} {{ selectedFlights.outward.arrival.airport.name }}</span>
                                        <span class="subtitle">
                                            {{ asZoneDate(selectedFlights.outward.departure.date,"UTC",selectedFlights.outward.departure.time,"EEE dd MMM")}}, {{asZoneTime(selectedFlights.outward.departure.time)}}, {{passengers.label}}
                                        </span>
                                        <span class="subtitle" v-if="isRoundTrip">{{ getFormattedFlightRate(selectedFlights.outward) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-2 total-price-container">
                            <!-- total -->
                            <div class="price" v-if="selectedFlights.outward || selectedFlights.return">
                                {{ $t("total") }} {{ getTotalPrice }}    
                            </div>
                            
                            <!-- button -->
                            <a  :href="selectedAirlineLink('outward')" target="_blank" title="Skyalps Home">
                                <div class="button selected continue-button disabled" v-if="(!selectedFlights.outward || (isRoundTrip && !selectedFlights.return))" :class="{double:selectionNeedsTwoTickets}">
                                    {{ $t("continue") }} <Icon v-if="!(!selectedFlights.outward || (isRoundTrip && !selectedFlights.return))" icon="mdi:arrow-up" rotate="90deg"></Icon>
                                </div>
                                <div class="button selected continue-button" v-else :class="{disabled: (!selectedFlights.outward || (isRoundTrip && !selectedFlights.return)), double:selectionNeedsTwoTickets}">
                                    <span>{{ $t("bookOn") }}</span><br/>{{ $t("skyalps") }} <Icon v-if="!(!selectedFlights.outward || (isRoundTrip && !selectedFlights.return))" icon="mdi:arrow-up" rotate="90deg"></Icon>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row main-row justify-content-lg-center" v-if="isRoundTrip">
            <div class="col">
                <div class="container">
                    <div class="row">
                        <!-- flights details -->
                        <div class="col">
                            <div class="selection" :class="{selected: selectedFlights.return}">
                                <div v-if="!selectedFlights.return">{{ $t("selectSecondFlight") }}</div>
                                <div v-else>
                                    <div class="plane">
                                        <Icon icon="el:plane" rotate="180deg" />
                                    </div>
                                    <div class="description">
                                        <span class="title">{{ $t("from") }} {{ selectedFlights.return.departure.airport.name }} {{ $t("to") }} {{ selectedFlights.return.arrival.airport.name }}</span>
                                        <span class="subtitle">
                                            {{ asZoneDate(selectedFlights.return.departure.date,"UTC",selectedFlights.return.departure.time,"EEE dd MMM")}}, {{asZoneTime(selectedFlights.return.departure.time)}}, {{passengers.label}}
                                        </span>                       
                                        <span class="subtitle" v-if="isRoundTrip">{{ getFormattedFlightRate(selectedFlights.return) }}</span>         
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-2">
                            <!-- button -->
                            <a  :href="selectedAirlineLink('return')" target="_blank" title="Skyalps Home" v-if="selectionNeedsTwoTickets">
                                <div class="button selected continue-button double" :class="{disabled: (!selectedFlights.outward || !selectedFlights.return)}">
                                    <span>{{ $t("bookOn") }}</span><br/>{{ $t("skyalps") }}  <Icon v-if="!(!selectedFlights.outward || !selectedFlights.return)" icon="mdi:arrow-up" rotate="90deg"></Icon>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- mobile -->
    <div class="container-fluid noi-selection-bar" v-if="showResults && isMobile && (!isShownBookButtons || !isMobileSummaryOpen)" :class="{'is-mobile-summary-open':isMobileSummaryOpen}" >
        <div class="row pb-1">
            <div class="col text-center">
                <div @click="toggleMobileSummary()">
                    <Icon class="mobile-summary-icon" v-if="!isMobileSummaryOpen" icon="ep:arrow-up"/>
                    <Icon class="mobile-summary-icon" v-else icon="ep:arrow-down"/>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col text-left">
                <span>{{ $t("tripSummary") }}</span>
                <!-- total -->
                <div class="price">
                    {{ $t("total") }} {{ getTotalPrice }}    
                </div>
                
                <!-- button -->
                <div @click="stepNext()"  class="button selected continue-button" :class="{disabled: isContinueButtonDisabled}" v-if="!isShownBookButtons || !isMobileSummaryOpen">
                    <span v-if="!(!selectedFlights.outward || (isRoundTrip && !selectedFlights.return))">
                        {{ $t("summary") }}
                    </span> 
                    <span v-else>
                        {{ $t("continue") }}
                    </span>
                </div>

                <!-- <a :href="selectedAirlineLink('outward')" target="_blank" title="Skyalps Home" v-if="currentMobileStep == 2">
                    <div class="button selected continue-button book-on" :class="{disabled: isContinueButtonDisabled}" >
                        <span>{{ $t("bookOn") }}</span><br/>{{ $t("skyalps") }} <Icon v-if="!(!selectedFlights.outward || (isRoundTrip && !selectedFlights.return))" icon="mdi:arrow-up" rotate="90deg"></Icon>
                    </div>
                </a> -->
            </div>
        </div>
    </div>
    <div class="mobile-summary-container" :class="{'only-summary':isShownBookButtons}" v-if="isMobileSummaryOpen">
        <div class="row">
            <div class="col main-title">
                {{ $t("summary") }}
            </div>
            <div class="col close-button">
                <div @click="toggleMobileSummary()">
                    <Icon @click="toggleMobileSummary()" icon="ep:close"/>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col search-description bottom-separator">
                <div class="title">{{ $t("from") }} {{ departureAirport.label }} {{ $t("to") }} {{ arrivalAirport.label }}</div>
                <div class="text">
                    {{ getSearchSubtitle(false) }}
                    <Icon class="pl-1" icon="bxs:user"/> {{ getSearchPeopleCount() }}
                </div> 
            </div>
        </div>
        <div class="row">
            <div class="col title">
                {{ $t("flights") }} <Icon  icon="ep:warning" v-if="selectionNeedsTwoTickets"/>
            </div>
        </div>
        <div class="row">
            <div class="col bottom-separator">
                <div class="row flight-container pb-3 pt-3" v-if="selectedFlights.outward">
                    <div class="col-2 flight-icon"> 
                        <img v-if="options.theme == 'skyalps'" :src="require('@/assets/icons/plane-big-blue.png')" height="24px"/>
                        <img v-else :src="require('@/assets/icons/plane-big-black.png')" height="24px"/>
                    </div>
                    <div class="col flight-description">
                        <div class="title">{{ $t("from") }} {{ selectedFlights.outward.departure.airport.name }} {{ $t("to") }} {{ selectedFlights.outward.arrival.airport.name }}</div>
                        <div class="text">
                            {{ asZoneDate(selectedFlights.outward.departure.date,"UTC",selectedFlights.outward.departure.time,"EEE dd MMM")}}, {{asZoneTime(selectedFlights.outward.departure.time)}} - {{asZoneTime(selectedFlights.outward.arrival.time)}}
                        </div>
                        <div><Icon icon="bxs:user"/> {{ getSearchPeopleCount() }}</div>

                        <a :href="selectedAirlineLink('outward')" target="_blank" title="Skyalps Home" v-if="((!isRoundTrip && selectedFlights.outward) || (selectedFlights.return && selectionNeedsTwoTickets))">
                            <div class="button selected continue-button book-on">
                                <span>{{ $t("bookOn") }}</span><br/>{{ $t("skyalps") }} <Icon icon="mdi:arrow-up" rotate="90deg"></Icon>
                            </div>
                        </a>
                    </div>
                    <div class="col-3 flight-price">
                        {{ getFormattedFlightRate(selectedFlights.outward) }}
                    </div>
                </div>
                <div class="row flight-container" v-else>
                    <div class="col flight-description pt-1 pb-1">
                        <strong>{{ $t("selectFirstFlight") }}</strong>
                    </div>
                </div>
                <div v-if="isRoundTrip">
                    <div class="row flight-container pb-3 pt-3" v-if="selectedFlights.return">
                        <div class="col-2 flight-icon"> 
                            <img v-if="options.theme == 'skyalps'" :src="require('@/assets/icons/plane-big-blue.png')" height="24px" class="rotate"/>
                            <img v-else :src="require('@/assets/icons/plane-big-black.png')" height="24px" class="rotate"/>
                        </div>
                        <div class="col flight-description">
                            <div class="title">{{ $t("from") }} {{ selectedFlights.return.departure.airport.name }} {{ $t("to") }} {{ selectedFlights.return.arrival.airport.name }}</div>
                            <div class="text">
                                {{ asZoneDate(selectedFlights.return.departure.date,"UTC",selectedFlights.return.departure.time,"EEE dd MMM")}}, {{asZoneTime(selectedFlights.return.departure.time)}} - {{asZoneTime(selectedFlights.return.arrival.time)}}
                            </div>
                            <div><Icon icon="bxs:user"/> {{ getSearchPeopleCount() }}</div>
    
                            <a :href="selectedAirlineLink('return')" target="_blank" title="Skyalps Home" v-if="(selectedFlights.return && selectionNeedsTwoTickets)">
                                <div class="button selected continue-button book-on" >
                                    <span>{{ $t("bookOn") }}</span><br/>{{ $t("skyalps") }} <Icon icon="mdi:arrow-up" rotate="90deg"></Icon>
                                </div>
                            </a>
    
                            <a :href="selectedAirlineLink('outward')" target="_blank" title="Skyalps Home" v-if="!selectionNeedsTwoTickets && ((!isRoundTrip && selectedFlights.outward) || (selectedFlights.return))">
                                <div class="button selected continue-button book-on">
                                    <span>{{ $t("bookOn") }}</span><br/>{{ $t("skyalps") }} <Icon icon="mdi:arrow-up" rotate="90deg"></Icon>
                                </div>
                            </a>
                        </div>
                        <div class="col-3 flight-price">
                            {{ getFormattedFlightRate(selectedFlights.return) }}
                        </div>
                    </div>
                    <div class="row flight-container" v-else>
                        <div class="col flight-description pt-1 pb-1">
                            <strong>{{ $t("selectSecondFlight") }}</strong>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col main-title bottom-separator">
                {{ $t("total") }}
            </div>
            <div class="col price bottom-separator">
                {{ getTotalPrice }}  
            </div>
        </div>
        <div class="row" v-if="selectionNeedsTwoTickets">
            <div class="col">
                <div class="warning-title yellow">
                    <Icon icon="ep:warning"/> {{ $t("warning") }}
                </div>
                <div class="text">
                    {{ $t("warningDescription") }}
                </div>
            </div>
        </div>
    </div>


    <!-- footer -->
    <div class="footer" style="font-size: 80%; padding: 0.5rem 1.5rem">
        <a href="https://opendatahub.com" target="_blank">powered by Open Data Hub
            <img src="https://third-party.opendatahub.com/opendatahub-logo/OpenDataHub-Logo-Black-nospace-01.svg" height="25px" style="display: inline-block; margin-left: 10px" />
        </a>
    </div>


  </div>
</template>

<script>
import axios from "axios"
import { DateTime, Settings } from "luxon"
import Vue, { ref } from "vue"

import { Icon } from '@iconify/vue2';
    
import AirportsDropdown from './AirportsDropdown.vue';
import PassengersDropdown from './PassengersDropdown.vue';
    

import DatePicker from "vue2-datepicker";

import {Hooper, Slide,Navigation as HooperNavigation} from 'hooper';


export default {
  components:{DatePicker,AirportsDropdown,PassengersDropdown,Hooper,HooperNavigation, Slide,Icon},
  name: "NoiFlightControl",
  //component props
  props: {
    options: Object,
    default: () => {
      return {
        from_ts: false,
        to_ts: false,
        airport: "BZO"
      }
    }
  },

  //components methods
  methods: {
    toggleMobileSummary(){
        if(this.currentMobileStep == 2 && this.isMobileSummaryOpen){
            this.stepBack();
        }
        this.isMobileSummaryOpen = !this.isMobileSummaryOpen;
    },
    getSearchSubtitle(showPeople=true){
        let str;
        if(this.isRoundTrip){
            let dpDate = DateTime.fromJSDate(this.rangeDate[0]).startOf('day');
            str = dpDate.toFormat('dd')+" "+dpDate.toFormat('MMM')
            let rdDate = DateTime.fromJSDate(this.rangeDate[1]).startOf('day');
            str += " - "+rdDate.toFormat('dd')+" "+rdDate.toFormat('MMM')
        }else{
            let dpDate = DateTime.fromJSDate(this.rangeDate).startOf('day');
            str = dpDate.toFormat('dd')+" "+dpDate.toFormat('MMM')
        }
        if(showPeople){
            str += ", "+this.passengers.label 
        }
        return str;
    },
    getSearchPeopleCount(){
        return  (this.passengers.value.adults || 0) + (this.passengers.value.children || 0) + (this.passengers.value.infants || 0)
    },
    getSelectedFlightSubtitle(flight){
        let str = this.asZoneDate(flight.date)+" "+this.asZoneTime(flight.time);
        str += ", "+this.passengers.label 
        return str;
    },
    selectFlight(what,flight){
        if(this.selectedFlights[what] == flight){
            this.clearSelectedFlight()
        }else{
            this.selectedFlights[what] = flight;
        }
    },
    clearSelectedFlight(what){
        this.selectedFlights[what] = null;
    },
    changeSearch(){
        this.clearSelectedFlight('outward');
        this.clearSelectedFlight('return');
        this.showResults = false;
    },
    isOutwardCalendarElementSelected(el){
        if(this.outwardFlightsSelectedDate == el.minDate.toFormat('yyyy-MM-dd')){
            return true;
        }

        return false;
    },
    isOutwardCalendarElementDisabled(el){
        if(this.isMobile){
            return false;
        }

        if(this.returnFlightsSelectedDate && (el.minDate.toFormat('yyyy-MM-dd') > this.returnFlightsSelectedDate)){
            return true;
        }

        return false;
    },
    isReturnCalendarElementSelected(el){
        if(this.returnFlightsSelectedDate == el.minDate.toFormat('yyyy-MM-dd')){
            return true;
        }

        return false;
    },
    isReturnCalendarElementDisabled(el){
        if(this.outwardFlightsSelectedDate && (el.minDate.toFormat('yyyy-MM-dd') < this.outwardFlightsSelectedDate)){
            return true;
        }

        return false;
    },
    handleOutwardCalendarElementClick(el){
        if(this.isOutwardCalendarElementDisabled(el)){
            return;
        }

        this.outwardFlightsSelectedDate = el.minDate.toFormat('yyyy-MM-dd');
    },
    handleReturnCalendarElementClick(el){
        if(this.isReturnCalendarElementDisabled(el)){
            return;
        }

        this.returnFlightsSelectedDate = el.minDate.toFormat('yyyy-MM-dd');        
    },
    onDepartureAirportSelect(el){
        this.departureAirport = el;
    },
    onArrivalAirportSelect(el){
        this.arrivalAirport = el;
    },
    onPassengersSelect(el){
        this.passengers = el;
    },
    disabledRangeHandler: function(date){
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return date < d;
    },
    updateCalendarActiveSelectionClasses: function(){
        setTimeout(()=>{
            let els = this.$el.getElementsByClassName("active");
            if(els.length > 0){
                els[0].className += " first-active"; 
            }
        });
    },
    handlePickDate: function(){
        this.updateCalendarActiveSelectionClasses()
    },
    handleOpenPopupEvent: function(){
        this.openedPopup = true;
        this.updateCalendarActiveSelectionClasses()
    },
    handleClosePopupEvent: function(){
        this.openedPopup = false;
    },
    dateFormat (classes, date) {
        if (!classes.disabled) {
          classes.disabled = date.getTime() < new Date()
        }
        return classes
      },

    loadMore(what) {
      this.max_entries[what] += this.options.maxforecast
    },
    selectedAirlineLink(route) {
        if(!this.selectedFlights.outward || (this.isRoundTrip && !this.selectedFlights.return)){
            return "";
        }

        // https://booking.skyalps.com/flight-results/FCO-VRN/2023-12-05/NA/2/0/0
        let outwardDate = DateTime.fromFormat(this.selectedFlights[route].departure.date, "yyyy-LL-dd", "UTC").toFormat("yyyy-LL-dd")
        let airports = this.selectedFlights[route].departure.airport.iataCode + "-" + this.selectedFlights[route].arrival.airport.iataCode
        let passangersAdults = this.passengers.value.adults
        let passangersChildren = this.passengers.value.children
        let passangersInfant = this.passengers.value.infants;
        if(this.passengers.value.infants){
            passangersInfant = this.passengers.value.infants
        }
        
        let returnDate = "NA";
        if(this.isRoundTrip && !this.selectionNeedsTwoTickets){
            // https://booking.skyalps.com/flight-results/FCO-VRN/2023-12-06/2023-12-08/2/0/0
            returnDate = DateTime.fromFormat(this.selectedFlights.return.departure.date, "yyyy-LL-dd", "UTC").toFormat("yyyy-LL-dd")
        }
       
        let link = "https://booking.skyalps.com/flight-results/" + airports + "/" + outwardDate + "/"+ returnDate +"/"+passangersAdults+"/"+passangersChildren+"/"+passangersInfant
        return link
    },
    asZoneTime(time = "00:00", source_zone = "UTC") {
        if (time == "") return ""
        let datetime = DateTime.fromFormat(time, "T", {
            zone: source_zone
        })
        datetime = datetime.setZone(this.current_timezone)
        return datetime.toFormat("HH:mm")
    },
    asZoneDate(date = "2022-01-01", source_zone = "UTC", time = "00:00",outputFormat = "EEE, dd MMM") {
        if (date == "") return ""
        let datetime = DateTime.fromFormat(date + " " + time, "yyyy-LL-dd T", {
            zone: source_zone
        })
        datetime = datetime.setZone(this.current_timezone)
        return datetime.toFormat(outputFormat)
    },
    updateTime() {
        let time = DateTime.utc()
        time = time.setZone(this.current_timezone)
        this.time = time
    },
    getShownTime(flight){  
        let totalMinutesTime = Math.round((flight.arrival.timestamp-flight.departure.timestamp)/60);
        let string = "-";
        if(totalMinutesTime >= 60){
            let hours = Math.floor(totalMinutesTime/60);
            let minutes =  totalMinutesTime%60;
            string =  hours+"h "+minutes+"min";
        }else{
            string =  totalMinutesTime+"min";
        }
        return string;
    },

    // resolve a message request
    $t: function (messageKey, fallbackMessage) {
        let els = messageKey.split(".");
        let langPack = this.currentLangPack
        for (var i = 0; i < els.length; i++) {
            var key = els[i];
            langPack = langPack[key];

            if (langPack === undefined) {
                if (fallbackMessage) {
                    return fallbackMessage;
                } else {
                    return "[" + messageKey + "]";
                }
            }
        }
        return langPack;
    },


    validateForm(){
        let roundTripCheck = this.roundTripCheck;
        let departureAirport = this.departureAirport;
        let arrivalAirport = this.arrivalAirport;
        let rangeDate = this.rangeDate;

        let errors = []
        if (!departureAirport || !departureAirport.value) {
            errors.push({
                "message":this.$t("errors.departureAirport.empty")
            })
        }
        if (!arrivalAirport || !arrivalAirport.value) {
            errors.push({
                "message":this.$t("errors.arrivalAirport.empty")
            })
        }

        if(roundTripCheck == "1"){
            if(!rangeDate){
                errors.push({
                    "message":this.$t("errors.departureDate.empty")
                })
                errors.push({
                    "message":this.$t("errors.returnDate.empty")
                })
            }else{
                if(!rangeDate[0]){
                    errors.push({
                        "message":this.$t("errors.departureDate.empty")
                    })
                }
                if(!rangeDate[1]){
                    errors.push({
                        "message":this.$t("errors.returnDate.empty")
                    })
                }
            }
        }else{
            if(!rangeDate){
                errors.push({
                    "message":this.$t("errors.departureDate.empty")
                })
            }
        }

        if(errors.length > 0){
            return {
                result:false,
                errors:errors
            }
        }else{
            return {
                result:true,
                data:{
                    roundTripCheck:roundTripCheck,
                    departureAirport:departureAirport,
                    arrivalAirport:arrivalAirport,
                    rangeDate:rangeDate
                }
            }
        }
    },

    isFormValid: function(){
        let formValidationResponse = this.validateForm();
        if(formValidationResponse.result == false){
            return false;
        }
        return true;
    },

    async search(){
        //form validation
        let formValidationResponse = this.validateForm();
        if(formValidationResponse.result == false){
            let validatedFormErrors = formValidationResponse.errors;
            return false;
        }
        let validatedFormData = formValidationResponse.data;

        this.updateTime()
        this.loadingResults = true;
        this.showResults = true;

        await this.fetchSchedules(validatedFormData);

        this.loadingResults = false;
    },
    swapAirports: function(){
        let toAirport = this.arrivalAirport
        this.$refs.arrivalAirportSelector.setValue(this.departureAirport);
        this.$refs.departureAirportSelector.setValue(toAirport);
    },  
    addWhereCondition: function(where,condition){
        if(where != ""){
            where += ","
        }
        return where += condition;
    },  
    parseData: function(data){
        let parsedData = {};
        for(let i = 0; i< data.data.data.length; i++){
            let o = data.data.data[i];
            let datetime = DateTime.fromFormat(o.smetadata.fltsfromperiod + " " + o.smetadata.std, "yyyy-LL-dd T",{ zone: "UTC" })

            let rate = false;
            // let rate =  o.smetadata.fares ? o.smetadata.fares["SKY_LIGHT"] : null
            if(o.smetadata.fares){
                for(var key in o.smetadata.fares){
                    let f = o.smetadata.fares[key]; 
                    let rawRate =
                        f.fare.adultFareOW +
                        f.fare.tax1OW +
                        f.fare.tax2OW +
                        f.fare.tax3OW +
                        f.fare.tax4OW

                    if(rate === false || rawRate<rate){
                        rate = rawRate;
                    }
                }
            }

            if (isNaN(rate) || rate == 0) rate = false

            //check for airports map
            if(!this.airports[o.smetadata.fromdestination]){
                console.log("Error: any departure airport named '"+o.smetadata.fromdestination+"' has been found in mapping.")
            }
            if(!this.airports[o.smetadata.todestination]){
                console.log("Error: any arrival airport named '"+o.smetadata.todestination+"' has been found in mapping.")
            }

            let obj = {
                departure:{
                    date:o.smetadata.fltsfromperiod.replace(/\//g, "-"),
                    time:o.smetadata.std,
                    timestamp:o.smetadata.departure_timestamp,
                    airport:{
                        iataCode:o.smetadata.fromdestination,
                        name:this.airports[o.smetadata.fromdestination].name,
                        coordinates:this.airports[o.smetadata.fromdestination].pos
                    }
                },
                arrival:{
                    date:o.smetadata.fltstoperiod.replace(/\//g, "-"),
                    time:o.smetadata.sta,
                    timestamp:o.smetadata.arrival_timestamp,
                    airport:{
                        iataCode:o.smetadata.todestination,
                        name:this.airports[o.smetadata.todestination].name,
                        coordinates:this.airports[o.smetadata.todestination].pos
                    }
                },
                status: o.smetadata.remark ? o.smetadata.remark : "SCHEDULED",
                company: o.sorigin,
                rates: rate ? { basic_adult_oneway_withtaxes: rate } : null
            }

            let flightInfo = this.getFlightInfo(obj);
            obj.flightInfo = flightInfo;

            let k = obj.departure.date;
            if(!parsedData[k]){
                parsedData[k] = [];
            }
            parsedData[k].push(obj)
        }

        // sort by timestamps
        for(let k in parsedData){
            parsedData[k].sort(this.sortByTimestamp)
        }
        return parsedData
    },
    async getData(whereCondition){
        //compile get parameters
        let params = {
            limit: "-1",
            offset: "0",
            shownull: "false",
            distinct: "true",
            where: whereCondition,
            origin: "webcomp-flightdata"
        }
        params = new URLSearchParams(params).toString()
        
        //make request
        let data = await axios.get(this.options.rest_endpoint + params)
        return data;
    },
    async fetchSchedules(searchData) {
        try {

            // getting outward flights
            //adding where conditions
            let where = ""
            if(searchData.departureAirport && searchData.departureAirport.value){
                let els = searchData.departureAirport.value.split("|");
                let airportOrCondition = "";
                if(els.length > 1){
                    airportOrCondition += "or("
                    for(let i = 0; i<els.length; i++){
                        if(i > 0){
                            airportOrCondition += ","
                        }
                        airportOrCondition += "smetadata.fromdestination.eq."+els[i]
                    }
                    airportOrCondition += ")"
                }else{
                    airportOrCondition = "smetadata.fromdestination.eq."+searchData.departureAirport.value+"";
                }
                where = this.addWhereCondition(where,airportOrCondition);
            }
            if(searchData.arrivalAirport){
                let els = searchData.arrivalAirport.value.split("|");
                let airportOrCondition = "";
                if(els.length > 1){
                    airportOrCondition += "or("
                    for(let i = 0; i<els.length; i++){
                        if(i > 0){
                            airportOrCondition += ","
                        }
                        airportOrCondition += "smetadata.todestination.eq."+els[i]
                    }
                    airportOrCondition += ")"
                }else{
                    airportOrCondition = "smetadata.todestination.eq."+searchData.arrivalAirport.value+"";
                }
                where = this.addWhereCondition(where,airportOrCondition);
            }

            // handle dates
            let departureDate = null;
            let returnDate = null;
            if(searchData.roundTripCheck == "1"){
                if(searchData.rangeDate){
                    if(searchData.rangeDate[0]){
                        departureDate = searchData.rangeDate[0];
                    }
                    if(searchData.rangeDate[1]){
                        returnDate = searchData.rangeDate[1];
                    }
                }
            }else{
                departureDate = searchData.rangeDate;
            }

            if(departureDate){

                let centerDate = DateTime.fromJSDate(departureDate).startOf('day');
                this.outwardFlightsSelectedDate = centerDate.toFormat('yyyy-MM-dd');

                let departureDateLower = centerDate.minus({ days: Math.round(this.clusterNumber/2)-1 });
                let departureDateUpper = centerDate.plus({ days: Math.round(this.clusterNumber/2) });
                where = this.addWhereCondition(where,"smetadata.departure_timestamp.gt."+departureDateLower.toMillis()/1000);
                where = this.addWhereCondition(where,"smetadata.departure_timestamp.lt."+departureDateUpper.toMillis()/1000);
            }else{
                let now = new Date();
                where = this.addWhereCondition(where,"smetadata.departure_timestamp.gt."+now.getTime()/1000);
            }
            where = "and("+where+")"

            let data = await this.getData(where);

            //parse received data
            this.outwardFlights = this.parseData(data)

            //getting return flights
            if(searchData.roundTripCheck == "1"){
                //adding where conditions
                where = ""

                if(searchData.departureAirport && searchData.departureAirport.value){
                    let els = searchData.departureAirport.value.split("|");
                    let airportOrCondition = "";
                    if(els.length > 1){
                        airportOrCondition += "or("
                        for(let i = 0; i<els.length; i++){
                            if(i > 0){
                                airportOrCondition += ","
                            }
                            airportOrCondition += "smetadata.todestination.eq."+els[i]
                        }
                        airportOrCondition += ")"
                    }else{
                        airportOrCondition = "smetadata.todestination.eq."+searchData.departureAirport.value+"";
                    }
                    where = this.addWhereCondition(where,airportOrCondition);
                }
                if(searchData.arrivalAirport){
                    let els = searchData.arrivalAirport.value.split("|");
                    let airportOrCondition = "";
                    if(els.length > 1){
                        airportOrCondition += "or("
                        for(let i = 0; i<els.length; i++){
                            if(i > 0){
                                airportOrCondition += ","
                            }
                            airportOrCondition += "smetadata.fromdestination.eq."+els[i]
                        }
                        airportOrCondition += ")"
                    }else{
                        airportOrCondition = "smetadata.fromdestination.eq."+searchData.arrivalAirport.value+"";
                    }
                    where = this.addWhereCondition(where,airportOrCondition);
                }

                if(returnDate){
                    let centerDate = DateTime.fromJSDate(returnDate).startOf('day');
                    this.returnFlightsSelectedDate = centerDate.toFormat('yyyy-MM-dd');
                    let returnDateLower = centerDate.minus({ days: Math.round(this.clusterNumber/2)-1 });
                    let returnDateUpper = centerDate.plus({ days: Math.round(this.clusterNumber/2) });
                    where = this.addWhereCondition(where,"smetadata.departure_timestamp.gt."+returnDateLower.toMillis()/1000);
                    where = this.addWhereCondition(where,"smetadata.departure_timestamp.lt."+returnDateUpper.toMillis()/1000);
                }else{
                    let now = new Date();
                    where = this.addWhereCondition(where,"smetadata.departure_timestamp.gt."+now.getTime()/1000);
                }
                where = "and("+where+")"

                data = await this.getData(where);

                //parse received data
                this.returnFlights = this.parseData(data)
            }

        } catch (error) {
            console.error(error)
        }
    },
    sortByTimestamp: function (a, b) {
        if (a.timestamp < b.timestamp) {
            return -1
        }
        if (a.timestamp > b.timestamp) {
            return 1
        }
        return 0
    },
    sortByDateTime: function (a, b) {
        const adate = a.departure.date + "/" + a.departure.time
        const bdate = b.departure.date + "/" + b.departure.time
        let adatetime = DateTime.fromFormat(adate, "yyyy-LL-dd/H:mm", {zone: "UTC"})
        let bdatetime = DateTime.fromFormat(bdate, "yyyy-LL-dd/H:mm", {zone: "UTC"})

        if (adatetime < bdatetime) {
            return -1
        }
        if (adatetime > bdatetime) {
            return 1
        }
        return 0
    },
    
    handleViewportResize: function () {
        setTimeout(()=>{
            const wi = this.$refs.viewport.clientWidth
            this.device = "desktop"
            if (wi < 1200) this.device = "small-desktop"
            if (wi < 992) this.device = "tablet"
            if (wi < 576) this.device = "smartphone"
        })
    },
    getFormattedFlightRate(flight){
        if(flight.rates && flight.rates.basic_adult_oneway_withtaxes){
            return this.formatEuro(flight.rates.basic_adult_oneway_withtaxes);
        }else{
            return "-";
        }
    },
    getFlightInfo(data) {
        let arrivalDate = DateTime.fromMillis(data.sta * 1000, {zone: this.current_timezone})
        let departureDate = DateTime.fromMillis(data.std * 1000, {zone: this.current_timezone})
        const arrival_diff = arrivalDate.diff(this.time, ["minutes"]).toObject()["minutes"]
        const departure_diff = departureDate.diff(this.time, ["minutes"]).toObject()["minutes"]

        // landed
        if (arrival_diff < 0) {
            return {
                text: "LANDED",
                planeLineClass:"end",
                colorClass: "gray"
            }
        }

        // in flight
        if (arrival_diff > 0 && departure_diff < 0) {
            return {
                text: "IN_FLIGHT",
                planeLineClass:"middle",
                colorClass: "green"
            }
        }
        
        // boarding => departure - 30m
        if (departure_diff < 30) {
            return {
                text: "BOARDING",
                planeLineClass:"start",
                colorClass: "green"
            }
        }

        // scheduled
        if (departure_diff > 0) {
            return {
                text: "SCHEDULED",
                planeLineClass:"start",
                colorClass: "gray"
            }
        }

        return {
            text: "",
            planeLineClass:"start",
            colorClass: "yellow"
        }
    },
    getCalendarElements(what){
        let centerDate = DateTime.now().startOf('day');
        if(this.roundTripCheck == "1"){
            if(this.rangeDate && this.rangeDate[what]){
                centerDate = DateTime.fromJSDate(this.rangeDate[what]).startOf('day');
            }
        }else{
            if(this.rangeDate){
                centerDate = DateTime.fromJSDate(this.rangeDate).startOf('day');
            }
        }

        let els = []
        for(let i = -Math.round(this.clusterNumber/2)+1; i<Math.round(this.clusterNumber/2); i++){
            let minDate = centerDate.plus({ days: 1*i });
            let maxDate = minDate.plus({ days: 0 });
            let k = minDate.toFormat('yyyy')+"-"+minDate.toFormat('MM')+"-"+minDate.toFormat('dd')
            let el = {
                key:k,
                subLabel:minDate.toFormat('dd')+" "+minDate.toFormat('MMM'),
                minDate:minDate,
                maxDate:maxDate
            }
            els.push(el)
        }
        
        return els;
    },
    formatEuro(val){
        return val.toFixed(2).replace(".",",")+" €"
    },
    getLowestAvailablePrice(what,key){
        if(what == 'outward'){
            if(this.outwardFlights && this.outwardFlights[key]){
                const min = Math.min(...this.outwardFlights[key].filter((item) => (item.rates && item.rates.basic_adult_oneway_withtaxes)).map((item) => {
                    return item.rates.basic_adult_oneway_withtaxes
                }))
                if(min == null || min == Infinity){
                    if(this.outwardFlights[key].length === 0){
                        return "-";
                    }else{
                        return "NA";
                    }
                }else{
                    return this.formatEuro(min);
                }
            }
        }else if(what == 'return'){
            if(this.returnFlights && this.returnFlights[key]){
                const min = Math.min(...this.returnFlights[key].filter((item) => (item.rates && item.rates.basic_adult_oneway_withtaxes)).map((item) => {
                    return item.rates.basic_adult_oneway_withtaxes
                }))
                if(min == null || min == Infinity){
                    if(this.returnFlights[key].length === 0){
                        return "-";
                    }else{
                        return "NA";
                    }
                }else{
                    return this.formatEuro(min);
                }
            }
        }
        
        return "-";
    },
    stepBack(){
        if(this.currentMobileStep == 0){
            //go to search change
            this.changeSearch();
            
        }else{
            if(this.currentMobileStep == 2 && this.roundTripCheck == '0'){
                this.currentMobileStep -= 2;
            }else{
                if(this.currentMobileStep == 1){
                    this.clearSelectedFlight('return');
                }
                this.currentMobileStep -= 1;
            }
        }
    },
    stepNext(){
        if(this.isContinueButtonDisabled){
            return;
        }
        if(this.mobileSteps.length >= this.currentMobileStep){
            if(this.currentMobileStep == 0 && this.roundTripCheck == '0'){
                this.currentMobileStep += 2;
            }else{
                this.currentMobileStep += 1;
            }

            if(this.currentMobileStep == 2){
                this.toggleMobileSummary();
            }
        }

        
        // return flight selection
        if(this.currentMobileStep == 1){
            setTimeout(()=>{
                const hop = this.$refs.returnHooper
                this.returnFlightsSelectedDate = this.returnCalendarElements[this.getTimeInterval].minDate.toFormat('yyyy-MM-dd')     
                if(hop){
                    hop.slideTo(this.getTimeInterval);
                }
            });
        }
    }
  },

  //computed calculations
  computed: {
    isShownBookButtons(){
        return ((!this.isRoundTrip && this.selectedFlights.outward) || (this.selectedFlights.return))
    },
    selectionNeedsTwoTickets(){
        if(!this.isRoundTrip){
            return false;
        }
        if(this.selectedFlights.outward && this.selectedFlights.return && 
            (
                this.selectedFlights.outward.departure.airport.iataCode !== this.selectedFlights.return.arrival.airport.iataCode ||
                this.selectedFlights.outward.arrival.airport.iataCode !== this.selectedFlights.return.departure.airport.iataCode
            )){
            return true;
        }else{
            return false;
        }
    },
    isContinueButtonDisabled(){
        return ((this.currentMobileStep == 0 && !this.selectedFlights.outward) || (this.currentMobileStep == 1 && !this.selectedFlights.return))
    },
    getHooperItemsToShow(){
        if(this.device == 'smartphone'){
            return 3;
        }else if(this.device == 'tablet'){
            return 5;
        }else if(this.device == 'small-desktop'){
            return 6;
        }else{
            return 7;
        }
    },
    getMobileStepTitle(){
        let str = "";
        if(this.currentMobileStep == 0){
            str += "FLIGHT TO "+this.arrivalAirport.label;
        }else if(this.currentMobileStep == 1){
            str += "FLIGHT TO "+this.departureAirport.label;
        }
        return str;
    },  
    isMobile(){
        return (this.device == 'smartphone' || this.device == 'tablet');
    },
    getTotalPrice(){
        let total = 0;
        if(this.selectedFlights.outward && this.selectedFlights.outward.rates && this.selectedFlights.outward.rates.basic_adult_oneway_withtaxes){
            total += this.selectedFlights.outward.rates.basic_adult_oneway_withtaxes;
        }
        if(this.selectedFlights.return && this.selectedFlights.return.rates && this.selectedFlights.return.rates.basic_adult_oneway_withtaxes){
            total += this.selectedFlights.return.rates.basic_adult_oneway_withtaxes;
        }
        
        return this.formatEuro(total);
    },
    getTimeInterval(){
        let index = this.getDefaultTimeIntervalM

        if(this.selectedTimeIntervalIndex){
            if(this.isMobile){                
                index = this.selectedTimeIntervalIndex-2;
            }else{
                index = this.selectedTimeIntervalIndex-1;
            }
        }

        if(this.isMobile && this.outwardFlightsSelectedDate){
            while(index < this.returnCalendarElements.length){
                if(this.returnCalendarElements[index].minDate.toFormat('yyyy-MM-dd') >= this.outwardFlightsSelectedDate){
                    break;
                }
                
                index++;
            }
        }
        
        return index;
    },
    getDefaultTimeInterval(){        
        if(!this.clusterNumber){
            return 0;
        }

        return Math.round(this.clusterNumber/2)+1;
    },
    outwardCalendarElements(){
        let els = this.getCalendarElements(0);
        return els;
    },
    returnCalendarElements(){
        let els = this.getCalendarElements(1);
        return els;
    },
    datePickerLabelFocused(){
        if(this.openedPopup || 
            (this.isRoundTrip && (this.rangeDate && this.rangeDate.length == 2 &&  this.rangeDate[0] != null  && this.rangeDate[0] != "")) || 
            (!this.isRoundTrip && (this.rangeDate != null && this.rangeDate != ""))){
            return true;
        }

        return false;
    },  
    isRoundTrip() {
      return (this.roundTripCheck == 1); 
    },
    hasOutwardFlights() {
        if(this.outwardFlights){
            return (this.outwardFlights[this.outwardFlightsSelectedDate].length > 0); 
        }
        return false;
    },
    hasReturnFlights() {
        if(this.returnFlights){
            return (this.returnFlights[this.returnFlightsSelectedDate].length > 0); 
        }
        return false;
    },
    lastOutwardFlights() {
        let els = []
        if(this.outwardFlights && this.outwardFlights[this.outwardFlightsSelectedDate]){
            els = this.outwardFlights[this.outwardFlightsSelectedDate].slice(0, this.max_entries.return)
        }
        return els
    },
    lastReturnFlights() {
        let els = []
        if(this.returnFlights && this.returnFlights[this.returnFlightsSelectedDate]){
            els = this.returnFlights[this.returnFlightsSelectedDate].slice(0, this.max_entries.return)
        }
        return els
    },
    sortedAirports() {
        let sortedAirports = []
        Object.keys(this.airports).map((key)=>{
            let o = this.airports[key];
            o.key = key
            sortedAirports.push(o)
        });
        
        sortedAirports = sortedAirports.sort((a,b)=>{
            if(a.name<b.name) return -1;
            if(b.name<a.name) return 1;
            else return 0;
        })
        return sortedAirports;
    },
    sortedAirportsClusters() {
        let sortedAirportsClusters = []
        this.airportsClusters.sort((a,b)=>{
            if(a.name<b.name) return -1;
            if(b.name<a.name) return 1;
            else return 0;
        }).map((el)=>{
            let o = {
                label:el.name+' (All)',
                value:el.airports.join('|'),
                airports:[]
            }

            o.airports = el.airports.sort((a,b)=>{
                if(a.name<b.name) return -1;
                if(b.name<a.name) return 1;
                else return 0;
            }).map((airportKey)=>{
                return {
                    value:airportKey,
                    label:this.airports[airportKey].name
                };
            });

            sortedAirportsClusters.push(o)
        });
        
        // sortedAirports = sortedAirports.sort((a,b)=>{
        //     if(a.name<b.name) return -1;
        //     if(b.name<a.name) return 1;
        //     else return 0;
        // })
        return sortedAirportsClusters;
    }
  },

  //on mount component
  mounted: function () {
    //init current language
    this.currentLanguage = "en";
    if(this.options.language){
        this.currentLanguage = this.options.language;
    }
    
    //init current langPack
    let fullLangPack = require("../mappings/languages.json");
    if (this.options.langPack){
        fullLangPack = { ...fullLangPack, ...this.options.langPack }
    }
    if(fullLangPack[this.currentLanguage]){
        this.currentLangPack = fullLangPack[this.currentLanguage]
    }else{
        this.currentLangPack = fullLangPack['en']
    }

    //init periods
    this.selectedTimeIntervalIndex = this.getDefaultTimeInterval;

    Settings.defaultLocale = this.currentLanguage

    //init timezone
    this.current_timezone = this.options.timezone
    
    //init units as metric
    if (this.options.metricUnits) {
      this.units = {
        speed: "km/h",
        alt: "m"
      }
    }
    
    this.roundTripCheck = 1;

    //run resize event
    this.handleViewportResize()
  },
  //component whatcers
  watch: {
    "roundTripCheck": function () {
        this.rangeDate = null;
    }
  },

  //on component has been created
  created: async function () {
    
    this.updateTime()
    this.time = this.time.setZone(this.current_timezone)

    // "container"-queries
    window.addEventListener("resize", this.handleViewportResize)

    this.max_entries.outward = this.options.maxforecast
    this.max_entries.return = this.options.maxforecast

  },
  destroyed() {
    window.removeEventListener("resize", this.handleViewportResize)
  },
  data() {
      return {
        isMobileSummaryOpen:false,
        currentMobileStep:0,
        mobileSteps:[
            {
                key:'departure'
            },
            {
                key:'arrival'
            },
            {
                key:'summary'
            }
        ],
        clusterNumber:31,
        openedPopup:false,
        outwardHooper:ref(),
        returnHooper:ref(),
        rangeDate:ref(),
        roundTripCheck:ref(),
        departureAirportSelector:ref(),
        arrivalAirportSelector:ref(),
        departureAirport:ref(),
        arrivalAirport:ref(),
        passengers:{value:{adults:1,children:0,infants:0},label:"1 adult"},
        zoneindex: 1,
        device: "desktop",
        showResults: false,
        loadingResults: false,
        current_timezone: "",
        selectedFlights:{
            outward:null,
            return:null
        },
        outwardFlightsSelectedIndex:0,
        returnFlightsSelectedIndex:0,
        outwardFlightsSelectedDate:null,
        returnFlightsSelectedDate:null,
        outwardFlights: {},
        returnFlights: {},
        time: "00:00:00 UTC",
        currentLangPack:{},
        units: {
            speed: "kts",
            alt: "ft"
        },
        max_entries: {
            outward:5,
            return:5
        },
        airports: require("../mappings/airports.js"),
        airportsClusters: require("../mappings/airportsClusters.js")
    }
  }
}
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap.scss";
@import "~vuelayers/dist/vuelayers.min.css";
@import "../css/hooper.css";
@import "../css/vue2-datepicker.css";

.noi-flightdata-booking {

    font-family: var(--noi-font-family, 'Source Sans Pro', 'Barlow Semi Condensed',Verdana);
    font-size: var(--basic-font-size, 16px);
    color: var(--noi-text-primary, #000000);
    background-color: white;;

    a {
        text-decoration: none;
        color: var(--noi-text-primary, #0068b4);
    }

    h1,h2,h3,h4,h5,h6 {
        color: var(--noi-text-primary, #000000);
    }

    h1 {
        font-size: 3rem;
    }

    h2 {
        font-size: 1.875rem;
        font-weight: 500;
        line-height: 2.5rem;
        margin-bottom: 0.125rem;
        padding-top: 0.25rem;
        
        .iconbg {
            display: inline-block;
            background: black;
            border-radius: 5px;
            padding: 4px;
        }
    }

    h3 {
        font-size: 2rem;
        background:#6e6e6d;
    }

    .row{
        .noi-col-1{
            flex: 0 0 auto;
            width: 8.33%;
        }
        .noi-col-2{
            flex: 0 0 auto;
            width: 16.66%;
        }
        .noi-col-3{
            flex: 0 0 auto;
            width: 25%;
        }
        .noi-col-4{
            flex: 0 0 auto;
            width: 33.33%;
        }
        .noi-col-5{
            flex: 0 0 auto;
            width: 41.66%;
        }
        .noi-col-6{
            flex: 0 0 auto;
            width: 50%;
        }
        .noi-col-7{
            flex: 0 0 auto;
            width: 58.33%;
        }
        .noi-col-8{
            flex: 0 0 auto;
            width: 66.66%;
        }
        .noi-col-9{
            flex: 0 0 auto;
            width: 79%;
        }
        .noi-col-10{
            flex: 0 0 auto;
            width: 83.33%;
        }
        .noi-col-11{
            flex: 0 0 auto;
            width: 91.66%;
        }
        .noi-col-12{
            flex: 0 0 auto;
            width: 100%;
        }
    }

    &.skyalps {
        --noi-primary: #a1bad4;
        --noi-mid: #a1bad4;
        --noi-secondary: #004988;
        --noi-text-primary: black;
        --noi-text-secondary: white;
        --noi-font-family: 'Barlow Semi Condensed';
        --noi-text-blue: #004988;

        h2{
            font-weight: 600;
        }


        &.smartphone{
            .noi-selection-bar .price, .noi-flightdata-booking.tablet .noi-selection-bar .price{
                font-weight: 600;
            }
            .noi-results .noi-results-flights .noi-flights-results-list .noi-flights-results-row .noi-flight-row-airport span.hour, &.smartphone .noi-results .noi-results-flights .noi-flights-results-list .noi-flights-results-row .noi-flight-row-airport div.hour, .noi-flightdata-booking.tablet .noi-results .noi-results-flights .noi-flights-results-list .noi-flights-results-row .noi-flight-row-airport span.hour, .noi-flightdata-booking.tablet .noi-results .noi-results-flights .noi-flights-results-list .noi-flights-results-row .noi-flight-row-airport div.hour{
                font-weight: 600;
            }
            .mobile-summary-container{
                .row{
                    .main-title{
                        font-weight: 600;
                    }
                    .title{
                        font-weight: 600;
                    }
                    .warning-title{
                        font-weight: 600;
                    }
                    .price{
                        font-weight: 600;
                    }

                    .flight-container{
                        .flight-price{
                            font-weight: 600;
                        }
                    }
                }
            }
        }

        .button{
            color: var(--noi-text-blue, #004988);

            &.disabled{
                background-color: #a1bad4;
            }
        }

        .noi-search-fields-container{
            .noi-swap-icon{
                color: var(--noi-text-blue, #004988);
            }

            .noi-trip-type-container{
                input{
                    accent-color: #004988;
                }
            }
            
            .mx-datepicker{
                .mx-table-date .today{
                    color: var(--noi-text-blue, #4b74aa);
                }
                .mx-calendar-header-label {
                    color: var(--noi-text-blue, #4b74aa);
                }
                .mx-btn{
                    &.mx-btn-text{
                        color: var(--noi-text-blue, #4b74aa);
                    }
                }
                .mx-calendar-content .cell.active:before,
                .mx-calendar-content .cell.active.first-active:before,
                .mx-calendar-content .cell.in-range,
                .mx-calendar-content .cell.hover-in-range,
                .mx-calendar-week-mode .mx-date-row.mx-active-week{
                    background-color: #cbd2e7;
                }
            }
        }
        
        .noi-results{
            .noi-results-top-summary{
                .title{
                    span, svg{
                        color: var(--noi-text-blue, #004988);
                    }
                }
            }
            .noi-results-flights{
                .title{
                    color: var(--noi-text-blue, #004988);
                }
                .navigator{
                    color: white;
                    .horizontal-calendar{
                        .hooper-navigation{
                            fill:white;
                        }
                    }
                }
                .noi-flights-results-list .noi-flights-results-row .noi-flight-row-button .button{
                    font-weight: 600;
                }
            }
        }
        .noi-selection-bar{
            .selection{
                color: var(--noi-text-blue, #004988);
                .description{
                    .subtitle{
                        color: black;
                    }
                }
            }
            .price{
                color: var(--noi-text-blue, #004988);
            }
        }

    }

    .dark {
        img {
            -webkit-filter: invert(1);
            filter: invert(1);
        }
    }


    .load-more {
        cursor: pointer;

        td {
            color: black !important;
            background-color: var(--noi-jam-strong, #e4c200) !important;
        }
    }

    .sm-only {
        display: none;
    }
    .lg-only {
        display: block;
    }

    .noi-top-back-icon{
        position: absolute;
        left: 1rem;
        font-size: 1.4rem;
        top: 1.15rem;
    }

    
    /* MOBILE */
    &.smartphone, &.tablet {

        .row{
            .noi-col-mob-1{
                flex: 0 0 auto;
                width: 8.33%;
            }
            .noi-col-mob-2{
                flex: 0 0 auto;
                width: 16.66%;
            }
            .noi-col-mob-3{
                flex: 0 0 auto;
                width: 25%;
            }
            .noi-col-mob-4{
                flex: 0 0 auto;
                width: 33.33%;
            }
            .noi-col-mob-5{
                flex: 0 0 auto;
                width: 41.66%;
            }
            .noi-col-mob-6{
                flex: 0 0 auto;
                width: 50%;
            }
            .noi-col-mob-7{
                flex: 0 0 auto;
                width: 58.33%;
            }
            .noi-col-mob-8{
                flex: 0 0 auto;
                width: 66.66%;
            }
            .noi-col-mob-9{
                flex: 0 0 auto;
                width: 79%;
            }
            .noi-col-mob-10{
                flex: 0 0 auto;
                width: 83.33%;
            }
            .noi-col-mob-11{
                flex: 0 0 auto;
                width: 91.66%;
            }
            .noi-col-mob-12{
                flex: 0 0 auto;
                width: 100%;
            }
        }
        
        .button {
            &:not(.selected):hover{
                background-color: white;
                border: 1px solid var(--noi-secondary, black);
                color: var(--noi-text-primary, black);
            }
        }
        .sm-only {
            display: block;
        }
        .lg-only {
            display: none;
        }

        .hooper-list {
            margin-left: 0;
            width: 100%;
        }

        .noi-top-bar{
            &.trip{
                background-color: white;
                padding: 0.5rem 0;
                text-transform: uppercase;
                font-weight: 600;
                img{
                    height: 2rem;
                    &.rotate{
                        transform: rotate(0.5turn);
                    }
                }
            }
        }

        .noi-search-fields-container {
            .noi-trip-type-container{
                margin-bottom: 1rem;
            }
            .noi-swap-icon{
                top: 2.65rem;
                left: calc(100% - 4.15rem);
                width: 2.8rem;
                height: 2.8rem;
                border-radius: 1.4rem;
                padding-top: 0.45rem;
                padding-left: 0.6rem;

                img{
                    width: 1.5rem;
                }
            }
            input{
                margin: 0.25rem 0;
            }
        }

        .noi-results{
            margin-top:0;
            margin-bottom:0;
            min-height: 33rem;
            
            .noi-results-flights{
                margin-top: 0;

                .navigator{
                    height: 4rem;
                    margin: 0;
                    color: var(--noi-text-primary, black);
                    background-color: var(--noi-mid, #f5f5f5);

                    .horizontal-calendar{
                        width:100%;

                        .horizontal-calendar-element{
                            height: 4rem;
                            // min-width: 6.25rem;
                            // width: min-content;
                            width: 100px;
                            padding: 0.53rem 0;
                            text-transform: uppercase;

                            border-right:1px solid #f5f5f5;
                            border-left:1px solid #f5f5f5;
                            
                            &.selected{
                                border-right-color: black;
                                border-left-color: black;
                            }
                            &.day{
                                padding: 0.53rem 1rem;
                            }

                            span{
                                font-size: 1.1rem;
                                display: block;
                            }
                        }
                    }
                }

                .noi-flights-results-list{
                    background-color: #f0f0f0;
                    
                    .noi-flights-results-row{
                        background-color: white;
                        margin: 0.3rem;
                        padding:1rem;

                        .noi-flight-row-airport{
                            margin-top: 0;

                            span,div{
                                font-weight: 400;
                                &.hour{
                                    font-size:1.25rem;
                                    font-weight: 500;
                                }
                            }

                            &.departure{
                                text-align: left;
                                padding-left:0;
                            }
                            &.arrival{
                                text-align: right;
                                padding-right:0;
                            }
                        }

                        .noi-flight-row-path{
                            span{
                                font-weight: 400;
                            }
                            .noi-flight-row-plane-line{
                                div.plane{

                                    z-index: 2;
                                    font-size: 1.1rem;
                                }
                            }
                        }

                        .noi-flight-row-logo{
                            margin-top:0.8rem;
                            img{
                                max-width: 4.125rem;
                                margin:0;
                            }
                            span{
                                font-weight: 400;
                                font-size: 0.7rem;
                            }
                        }

                        .noi-flight-row-button{
                            .button{
                                font-weight: 600;
                            }
                        }
                    }
                }

            }

            .noi-loader-results-container{
                margin:0;
                // placeholder
                .placeholder-content {
                    height: 34rem;
                    &_item {                   
                        &:nth-child(1) {
                            top: 0rem;
                            left: 0;
                            width: 100%;
                            height: 0.5rem;
                        }
                        &:nth-child(2) {
                            top: 0.5rem;
                            left: 0;
                            width: 2%;
                            height: 8rem;
                        }
                        &:nth-child(3) {
                            top: 0.5rem;
                            left: 98%;
                            width: 2%;
                            height: 8rem;
                        }
                        &:nth-child(4) {
                            top: 8rem;
                            left: 0;
                            width: 100%;
                            height: 0.5rem;
                        }

                        // row 1
                        &:nth-child(5) {
                            top: 8.5rem;
                            left: 0;
                            width: 2%;
                            height: 8rem;
                        }
                        &:nth-child(6) {
                            top: 8.5rem;
                            left: 98%;
                            width: 2%;
                            height: 8rem;
                        }
                        &:nth-child(7) {
                            top: 16.5rem;
                            left: 0;
                            width: 100%;
                            height: 0.5rem;
                        }

                        // row 2
                        &:nth-child(8) {
                            top: 17rem;
                            left: 0;
                            width: 2%;
                            height: 8rem;
                        }
                        &:nth-child(9) {
                            top: 17rem;
                            left: 98%;
                            width: 2%;
                            height: 8rem;
                        }                            
                        &:nth-child(10) {
                            top: 25rem;
                            left: 0;
                            width: 100%;
                            height: 0.5rem;
                        }

                        // row 3
                        &:nth-child(11) {
                            top: 25.5rem;
                            left: 0;
                            width: 2%;
                            height: 8rem;
                        }
                        &:nth-child(12) {
                            top: 25.5rem;
                            left: 98%;
                            width: 2%;
                            height: 8rem;
                        }
                        &:nth-child(13) {
                            top: 33.5rem;
                            left: 0;
                            width: 100%;
                            height: 0.5rem;
                        }
                        
                    }
                }

                @keyframes placeholderAnimate {
                    0%{ background-position: -650px 0; }
                    100%{ background-position: 650px 0; }
                }

                
            }

        }
        
        
        .noi-selection-bar{
            height: 5.8rem;
            box-shadow: 0 -2px 8px -5px #000;
            z-index: 5;
           
            &.is-mobile-summary-open{
                box-shadow: none;
            }

            .mobile-summary-icon{
                font-size: 1.4rem;
            }

            .continue-button{
                right: 0.5rem;
                top:1.5rem;
                padding: 0.8rem 2.5rem;
                
                &.disabled{
                    padding: 0.8rem 2.5rem;
                }

                svg{
                    top:1rem;
                    right: 1.1rem;
                }

                &.book-on{
                    padding: 0.3rem 3rem 0.3rem 2rem;
                
                    svg{
                        top:0.9rem;
                    }
                }

            }

            .price{ 
                font-weight: 500;
                position: unset;
                padding: 0;
            }
        
        }

        .mobile-summary-container{
            position: absolute;
            overflow-y: scroll;
            padding-bottom: 2rem;
            top: 0;
            left: 0;
            width: 100%;
            height: calc(100% - 7rem);
            background-color: white;
            z-index: 3;

            &.only-summary{
                height: calc(100% - 2.6rem);
            }
            
            .row{
                padding:0 1rem;
                &:first-child {
                    padding-top:1rem;
                    padding-bottom:1rem;
                }
                .search-description{
                    div{
                        &:nth-child(1){
                            padding-bottom: 0.3rem;
                        }
                    }
                }

                .bottom-separator{
                    padding-bottom: 1rem;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .yellow{
                    color:#faa503;
                }

                .main-title{
                    text-align: left;
                    font-size: 1.25rem;
                    font-weight: 500;
                }
                .title{
                    text-align: left;
                    font-size: 1rem;
                    font-weight: 500;

                    svg{
                        color:#faa503;    
                        font-size: 1.3rem;
                        margin-top: -0.4rem;
                        margin-left: 0.3rem;
                    }
                }
                .warning-title{
                    text-align: left;
                    font-size: 1.25rem;
                    font-weight: 500;

                    svg{
                        color:#faa503;        
                        font-size: 2rem;
                        margin-top: -0.4rem;
                        margin-right: 0.3rem;
                    }
                }
                .close-button{
                    font-weight: 600;
                    text-align: right;
                    margin-top:0.3125rem;
                    font-size: 1.3rem;
                }
                .price{
                    text-align: right;
                    font-size: 1.25rem;
                    font-weight: 500;
                }

                .flight-container{
                    padding:0;
                    text-align: left;

                    &:first-child{
                        padding-top:0.5rem;
                    }

                    .flight-icon{
                        &.rotate{
                            transform: rotate(0.5turn);
                        }
                    }
                    .flight-description{

                        div{
                            padding-bottom: 0.3rem;
                            &:nth-child(3){
                                padding-bottom: 0.5rem;
                            }
                        }

                        .book-on{
                            font-size: 1rem;
                        }

                    }
                    .flight-price{
                        text-align: right;
                        font-size: 1.25rem;
                        font-weight: 500;
                    }
                }
            }
        }


    }
    &.tablet,&.small-desktop{
        .noi-search-fields-container {
            .mx-datepicker{
                .mx-datepicker-main{
                    &.mx-datepicker-popup{
                        left: calc(50% - 15.65rem);
                    }
                } 
                &.mx-datepicker-range{
                    .mx-datepicker-main{
                        &.mx-datepicker-popup{
                            left: calc(50% - 15.65rem);
                            
                            .mx-range-wrapper {
                                display: -webkit-box;
                                display: -ms-flexbox;
                                display: flex
                            }
                        }
                    } 
                }
            }
        }
    }
    &.smartphone{
        .noi-search-fields-container {
            .mx-datepicker{
                .mx-datepicker-main{
                    &.mx-datepicker-popup{
                        left: calc(50% - 7.65rem);
                    }
                } 
                &.mx-datepicker-range{
                    .mx-datepicker-main{
                        &.mx-datepicker-popup{
                            left: calc(50% - 7.65rem);

                            .mx-range-wrapper {
                                -webkit-box-orient: vertical;
                                -webkit-box-direction: normal;
                                -ms-flex-direction: column;
                                flex-direction: column
                            }
                        }
                    } 
                }
            }
        }
    }


    // eleemnts
    .noi-top-bar{
        background-color: #F5F4F6;
        text-align: center;

        img{
            padding: 0.25rem;
            margin: 0.25rem;
            width: auto;
            height: 3rem;
        }
    }
    .noi-description-bar{
        text-align: center;
        padding: 1rem;
        p{
            font-size: 1.125rem;
        }
    }


    .noi-search-fields-container {
        color: var(--noi-text-primary, #000000);
        width: 100%;
        background-color: #ffffff;
        margin-bottom: 2rem;

        .col{
            padding:0 0.625rem;
        }

        input{
            border: 1px solid var(--noi-light-bg, #F5F4F6);
            font-weight: 600;
        }

        .noi-trip-type-container{
            margin-bottom: 1rem;

            input{
                accent-color: black;
            }

            input:nth-child(2){
                margin-left: 1rem;
            }
        }

        .mx-datepicker{
            .mx-datepicker-main{
                &.mx-datepicker-popup{
                    left: -0.5rem;
                    top: 4.6rem;
                }
            } 
            &.mx-datepicker-range{
                .mx-datepicker-main{
                    &.mx-datepicker-popup{
                        left: calc(-50% + 0.5rem);
                        
                        .mx-range-wrapper {
                            display: -webkit-box;
                            display: -ms-flexbox;
                            display: flex
                        }
                    }
                } 
            }

            .mx-calendar-content{
                .cell.active{
                    background-color: var(--noi-secondary, black);
                    color:white;
                    :before{
                       background-color: var(--noi-secondary, #f5f5f5);
                    }
                }
                
            }
            .mx-table-date .today{
                color:black;
            }
            .mx-calendar-header-label {
                color:black;
            }
            .mx-btn{
                &.mx-btn-text{
                    color:black;
                    font-weight: 600;
                    font-size: 0.8rem;
                }
            }
            .mx-calendar-content .cell.active:before,
            .mx-calendar-content .cell.active.first-active:before,
            .mx-calendar-content .cell.in-range,
            .mx-calendar-content .cell.hover-in-range,
            .mx-calendar-week-mode .mx-date-row.mx-active-week{
                background-color: #f5f5f5;
            }
        }
        
        .noi-swap-icon{
            position: absolute;
            top:0.6rem;
            left:calc(50% - 1.15rem);
            width: 2.3rem;
            height: 2.3rem;
            border-radius: 1.15rem;
            text-align: center;
            z-index: 2;
            background-color: white;
            border: 1px solid var(--noi-light-bg, #F5F4F6);;
            margin: 0;
            padding-top: 0.25rem;
            padding-left: 0.45rem;
            font-size: 1.2rem;
            font-weight: 600;
            cursor: pointer;

            img{
                svg{
                    fill:red;
                }
                width: 1.25rem;
            }
        }
    
    }

    .noi-results {
        color:var(--noi-text-primary, black);
        width: 100%;
        background-color: #ffffff;
        color: white;
        height: 80%;
        margin: 2rem auto;
        overflow-y: auto; 
        overflow-x: hidden; 

        .noi-results-top-summary{
            .title{
                span{
                    display: inline;
                    font-size: 1.25rem;
                }
                div{
                    display: inline;
                    cursor: pointer;
                    margin: 0 0 0 0.5rem;
                }
                display: block;
                color:var(--noi-text-primary, black);
                font-weight: 600;
                font-size: 1.5rem;
            }
            span.subtitle{
                font-weight: 500;
                display: block;
                color:var(--noi-text-primary, black);
                font-size: 0.875rem;
            }
        }
        .noi-results-flights{
            margin: 2.5rem 0 0 0;
            color:var(--noi-text-primary, black);
            
            .title{
                font-size: 1.125rem;
                font-weight:600;
                color:var(--noi-text-primary, black);
                width: 100%;
                display: block;
                margin-bottom: 0.5rem;

                span{
                    text-transform: uppercase;
                }
            }
            .navigator{
                height: 4rem;
                margin: 0;
                color: var(--noi-text-primary, black);
                background-color: var(--noi-mid, #f5f5f5);

                .horizontal-calendar{
                    width:100%;

                    .horizontal-calendar-element{
                        height: 4rem;
                        width: min-content;
                        padding: 0.53rem 1rem;
                        text-align: center;
                        font-weight: 600;
                        font-size: 1.3rem;
                        cursor: pointer;
                        
                        &:not(.disabled):hover, &.selected{
                            color:var(--noi-text-secondary,white);
                            background-color: var(--noi-secondary, black);
                        }
                        &.disabled{
                            cursor: unset;
                            color:#6e6e6d;
                        }
                        
                        span{
                            font-weight: 400;
                            font-size: 0.9rem;
                            display: block;
                        }
                    }
                }
            }

            .noi-flights-any-result{
                margin-top: 2rem;
                text-align: center;
                color:var(--noi-text-primary,black);
            }

            .noi-flights-results-list{
                max-height: 30rem;;
                overflow-x: hidden;
                overflow-y: auto;

                .noi-flights-results-row{
                    text-align: center;
                    color: #000000;
                    padding: 1rem 0;
                    margin:0 2rem;
                    vertical-align: middle;
                    border-bottom:1px solid #f5f5f5;

                    .green{
                        color: green;
                    }
                    .gray{
                        color: gray;
                    }
                    .yellow{
                        color:gold;
                    }
                    .red{
                        color: red;
                    }

                    .noi-flight-row-status-badge{
                        text-align: left;
                        font-size: 2rem;
                    }
                    .noi-flight-row-logo{
                        img{
                            max-width: 8.125rem;
                            margin:1.1rem 0 0.6rem 0;
                        }
                        span{   
                            font-weight: 600;
                            font-size: 0.9rem;
                        }
                    }
                    .noi-flight-row-airport{
                        margin-top:0.5rem;
                        
                        span,div{
                            font-weight: 600;
                            &.hour{
                                display: block;
                                padding-bottom: 0.5rem;
                            }
                        }

                        div{
                            display: inline-block;
                        }

                        div.noi-flight-row-badge{
                            background-color: #f5f5f5;
                            border-radius: 0.25rem;
                            width: 2rem;
                            height: 1.3125rem;
                            font-size: 0.725rem;
                            padding-top: 0.2rem;
                            font-weight: 500;
                        }

                        &.departure{
                            
                        }
                        &.arrival{

                        }

                    }
                    .noi-flight-row-path{
                        // min-width: 20rem;

                        .noi-flight-row-plane-line{
                            margin: 1rem 0;
                            position: relative;

                            div.before,div.after{
                                height: 0.125rem;
                                position: absolute;
                                padding:0;
                                margin: 0;
                            }

                            div.before{
                                border-top:0.125rem solid var(--noi-secondary, black);
                                // width: calc(50% - 0.75rem);
                            }
                            div.plane{
                                font-size: 1.5rem;
                                background: white;
                                padding: 0 0.25rem;
                                margin: -0.9rem 0;
                                position: absolute;
                                width: 2rem;
                                color:var(--noi-secondary, black);
                                z-index: 2;
                                background-color: white;
                                line-height: 1.5rem;
                            }
                            div.after{
                                border-top:0.125rem solid var(--noi-mid, #f5f5f5);
                                // width: calc(50% - 0.75rem);
                            }

                            &.start{
                                div.before{
                                    width: 0;
                                }
                                div.plane{
                                    left:0;
                                }
                                div.after{
                                    width: calc(100% - 0.75rem);
                                    left:0.75;
                                }
                            }
                            &.middle{
                                div.before{
                                    width: calc(50% - 0.75rem);
                                    left:0;
                                }
                                div.plane{
                                    left:calc(50% - 2rem);
                                }
                                div.after{
                                    width: calc(50% - 0.75rem);
                                    left:50%;
                                }
                            }
                            &.end{
                                div.before{
                                    width: calc(100% - 0.75rem);
                                    left:0;
                                }
                                div.plane{
                                    left:calc(100% - 2rem);
                                }
                                div.after{
                                    width: 0;
                                }
                            }
                        }
                        span{
                            font-weight: 600;
                            font-size: 0.9rem;
                            position: relative;
                            top:0.5rem;
                        }
                        span.type{
                            color:#6e6e6d;
                        }
                    }
                    .noi-flight-row-flight-number{
                        font-weight: 600;
                        padding-top: 0.75rem;
                    }
                    .noi-flight-row-status{
                        font-weight: 600;

                        .status{
                            font-size: 1.2rem;

                        }
                        .details{
                            font-size: 0.7rem;
                            position: relative;
                            top: -0.375rem;
                        }
                    }
                    .noi-flight-row-button{
                        text-align: center;
                        margin-top:0.5rem; 
                        
                        .button{
                            font-weight: 500;
                        }
                    }
                }
                }
            
        }
    }     
    .noi-results-loader{
        color: rgba(0, 0, 0, 0.5);
        margin:50px 0;
    }
    .noi-selection-bar{
        background-color: white;    
        border-top: 1px solid #ced4da;
        border-bottom: 1px solid #ced4da;
        color: black;
        height: 7.1rem;
        position: sticky;
        bottom: 0;
        z-index: 2;

        
        &.oneway{
            height: 4.25rem;

            .selection{
                margin: 1.25rem 0;
            }
            .total-price-container{
                position: relative;
            }
            .price{
                position: absolute;
                top: 1.2rem;
                right: 14rem;
            }
            .continue-button{                
                position: unset;
                right: 0;
                top: 0;
                svg{
                    top: 1.6rem;
                    right: 4rem;
                }
            }
        }

        &:not(.oneway){
            .main-row{
                &:nth-child(1){
                    border-bottom: 1px dashed #ced4da;
                }
            }
        }
        

        .total-price-container{
            position: relative;
        }
        .price{
            position: absolute;
            top:2.3rem;
            width: max-content;
            right: 12rem;
            background: white;
            padding: 0 1rem;
            font-weight: 600;
            font-size: 1.5rem;
        }

        .selection{
            font-size: 1.125rem;
            font-weight: 600;
            margin: 0.9rem 0;
            display: inline;
            float: left;

            &.selected{
                // margin:0.7rem 0
            }

            &:nth-child(2){
                border-left: 1px solid #ced4da;
                margin-left: 1rem;
                padding-left: 1rem;
            }

            div{
                float: left;
                display: inline;
            }
            div.description{
                margin-left: 0.5rem;
            }

            span{
                display: block;
            }
            span.title{
                font-weight: 600;
                font-size: 1.25rem;
                display: inline-block;
            }
            span.subtitle{
                font-weight: 500;
                font-size: 0.875rem;
                display: inline-block;
                padding: 0 0 0 1rem;
            }
        }
        .continue-button{
            font-size: 1.125rem;
            margin: 0.45rem 0;
            padding: 0.3rem 4rem 0.3rem 3rem;
            max-width: fit-content;
            
            position: absolute;
            right: 0;
            top: 1.3rem;

            span{
                font-size: 1rem;
            }

            &.disabled{
                padding: 0.8rem 3.5rem;
            }
            &.double{
                position: relative;
                top: 0;
                right: 0;
                display: inline;
                float: right;
                font-size: 0.9rem;
                padding: 0.1rem 4rem 0.1rem 3rem;
                
                span{
                    font-size: 0.825rem;
                }

                svg{
                    top:0.8rem;
                    right: 2rem;
                }
            }
            svg{
                position: absolute;
                top:1.2rem;
                right: 2rem;
            }
        }
    }

    // loader
    .noi-loader-results-container{
        color: rgba(0, 0, 0, 0.5);
        margin:2rem 0;


        // placeholder
        .placeholder-content {
            height: 13rem;
            overflow: hidden;
            background: #000;
            position: relative;
            
            // Animation
            animation-duration: 1.7s;
            animation-fill-mode: forwards;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
            animation-name: placeholderAnimate;
            background: #f6f7f8; // Fallback
            background: linear-gradient(to right, #eee 2%, #ddd 18%, #eee 33%);
            background-size: 1200px; // Animation Area
            
            &_item {
                width: 100%;
                height: 2rem;
                position: absolute;
                background: #fff;
                z-index: 2;
                
                &:after,
                &:before {
                    width: inherit;
                    height: inherit;
                    content: '';
                    position: absolute;
                }
                
                // row 1
                &:nth-child(1) {
                    top: 0rem;
                    left: 5%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(2) {
                    top: 0rem;
                    left: 20%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(3) {
                    top: 0rem;
                    left: 35%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(4) {
                    top: 0rem;
                    left: 70%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(5) {
                    top: 0rem;
                    left: 85%;
                    width: 5%;
                    height: 3rem;
                }
                
                // row 2                 
                &:nth-child(6) {
                    top: 3rem;
                    left: 0;
                    height: 2rem;
                }
                &:nth-child(7) {
                    top: 5rem;
                    left: 5%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(8) {
                    top: 5rem;
                    left: 20%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(9) {
                    top: 5rem;
                    left: 35%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(10) {
                    top: 5rem;
                    left: 70%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(11) {
                    top: 5rem;
                    left: 85%;
                    width: 5%;
                    height: 3rem;
                }


                // row 3            
                &:nth-child(12) {
                    top: 8rem;
                    left: 0;
                    height: 2rem;
                }
                &:nth-child(13) {
                    top: 10rem;
                    left: 5%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(14) {
                    top: 10rem;
                    left: 20%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(15) {
                    top: 10rem;
                    left: 35%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(16) {
                    top: 10rem;
                    left: 70%;
                    width: 5%;
                    height: 3rem;
                }
                &:nth-child(17) {
                    top: 10rem;
                    left: 85%;
                    width: 5%;
                    height: 3rem;
                }
                
            }
        }

        @keyframes placeholderAnimate {
            0%{ background-position: -650px 0; }
            100%{ background-position: 650px 0; }
        }

        
    }
    
    //buttons
    .button {
        background-color: white;
        border: 1px solid var(--noi-secondary, black);
        color: var(--noi-text-primary, black);
        cursor: pointer;
        padding: 0.5rem 1.5rem;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 1.5rem;
        font-weight: 600;
        width: 100%;
        max-width: 9rem;
        border-radius: 0.25rem;

        &.dark{
            font-size: 1rem;
            padding: 1rem 2rem;
            background-color: var(--noi-secondary, black);
            border: none;
            color: var(--noi-text-seconday, white);
            max-width:none;
        }
        &:hover,&.selected{
            background-color: var(--noi-secondary, black);
            border: none;
            color: var(--noi-text-seconday, white);
        }
        &.disabled{
            background-color: #A7A7A7;
            // opacity:0.6;
            cursor: auto;
        }
    }

    // calendar
    .mx-icon-calendar{
        display: none;
    }
    .mx-icon-clear{
        position: absolute;
        right: 15px;
        top: 15px;
    }
    .noi-datepicker-input{
        height: calc(3.5rem + calc(var(--bs-border-width) * 2));
        min-height: calc(3.5rem + calc(var(--bs-border-width) * 2));
        line-height: 1.25;
        padding: 1.625rem 0.75rem 0.625rem 0.75rem;
    }
    .noi-input-label{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        height: 100%;
        padding: 1rem 0.75rem;
        overflow: hidden;
        text-align: start;
        text-overflow: ellipsis;
        white-space: nowrap;
        pointer-events: none;
        border: var(--bs-border-width) solid transparent;
        transform-origin: 0 0;
        transition: opacity 0.1s ease-in-out, transform 0.1s ease-in-out;
    }
    .noi-input-label.focused{
        color: rgba(var(--bs-body-color-rgb), 0.65);
        transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
    }

    


    .footer {
        background: #F5F4F6;
        width: 100%;
        text-align: right;
        font-size: 1rem;
        margin:0;
    }

}
</style>