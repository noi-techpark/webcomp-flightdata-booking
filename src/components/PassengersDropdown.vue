<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
    <div class="form-floating gx-1">
        <input  class="form-control" 
                :name="name" 
                type="text"
                ref="passengers"
                autocomplete="off"
                readonly="true"
                v-model="passengersText" 
                @focus="onFocus"
                placeholder="Search something..." >
                <!-- 
                @blur="onBlur" -->

        <div ref="dropdownContainer" class="passengers-dropdown-container text-left" v-bind:class="classObject"> <!-- @blur="onBlur" -->
            <h3>{{ placeholder }}</h3>
            <div class="passengers-dropdown-rows">
                <div class="row passengers-dropdown-row">
                    <div class="col-3 text-center">
                        <div class="passengers-plus-minus" :class="{disabled: selection.values.adults <= 1}" @click.stop="change('adults',-1)">-</div>
                    </div> 
                    <div class="col-6 text-center">
                        {{ selection.values.adults }} <span v-if="selection.values.adults <= 1">{{ $parent.$t("adult") }}</span><span v-else>{{ $parent.$t("adults") }}</span><br/>
                        <span class="subtitle">{{ $parent.$t("ages11") }}</span>
                    </div>
                    <div class="col-3 text-center">
                        <div class="passengers-plus-minus" @click.stop="change('adults',+1)">+</div>
                    </div> 
                </div>
                <div class="row passengers-dropdown-row">
                    <div class="col-3 text-center">
                        <div class="passengers-plus-minus" :class="{disabled: selection.values.children <= 0}" @click.stop="change('children',-1)">-</div>
                    </div> 
                    <div class="col-6 text-center">
                        {{ selection.values.children }} <span v-if="selection.values.children <= 1">{{ $parent.$t("child") }}</span><span v-else>{{ $parent.$t("children") }}</span><br/>
                        <span class="subtitle">{{ $parent.$t("ages2-11") }}</span>
                    </div>
                    <div class="col-3 text-center">
                        <div class="passengers-plus-minus" @click.stop="change('children',+1)">+</div>
                    </div> 
                </div>
                <div class="row passengers-dropdown-row">
                    <div class="col-3 text-center">
                        <div class="passengers-plus-minus" :class="{disabled: selection.values.infants <= 0}" @click.stop="change('infants',-1)">-</div>
                    </div> 
                    <div class="col-6 text-center">
                        {{ selection.values.infants }} <span v-if="selection.values.infants <= 1">{{ $parent.$t("infant") }}</span><span v-else>{{ $parent.$t("infants") }}</span><br/>
                        <span class="subtitle">{{ $parent.$t("ages2") }}</span>
                    </div>
                    <div class="col-3 text-center">
                        <div class="passengers-plus-minus" @click.stop="change('infants',+1)">+</div>
                    </div> 
                </div>
            </div>
        </div>
        
        <label :for="name" class="form-label">
            {{ placeholder }}
        </label>
    </div>

</template>

<script>
    
    import { ref } from 'vue';
    const passengers = ref();


    export default {
        props: {
            name: {
                type: String,
                default: "needToBeARamdumUniqueString"
            },
            placeholder: {
                type: String,
                default: "Type here"
            }
        },
        data() {
            return {
                isOpen: false,
                passengersText: '1 adult',
                selection:{
                    values:{adults:1,children:0,infants:0},
                    label:'1 adult'
                }
            }
        },
        computed: {
            classObject() {
                return {
                    'open': this.isOpen
                }
            },
        },

        methods: {
            onFocus() {
                this.isOpen = true
            },
            
            change(what,delta) {
                let minLimit = (what == 'adults') ? 1 : 0;
                let newVal = this.selection.values[what] + delta;
                if(newVal < minLimit){
                    return false;
                }
                
                this.selection.values[what] = newVal;
                this.selection.label = this.buildLabel(this.selection.values);
                this.passengersText = this.selection.label;
                
                this.$emit('clicked', { 'value': this.selection.values, 'label': this.selection.label });
                return true;
            },
            buildLabel(values){
                let str = (values.adults + ((values.adults <= 1) ? ' '+this.$parent.$t("adult") : ' '+this.$parent.$t("adults")));
                if(values.children > 0){
                    str += " - "+(values.children + ((values.children <= 1) ? ' '+this.$parent.$t("child") : ' '+this.$parent.$t("children")));
                }
                if(values.infants > 0){
                    str += " - "+(values.infants + ((values.infants <= 1) ? ' '+this.$parent.$t("infant") : ' '+this.$parent.$t("infants")));
                }
                return str;
            },
            handleClickOutside(evt) {
                if (!this.isOpen) return;
                const el = this.$el;
                const container = this.$refs.dropdownContainer
                if (el && !evt.composedPath().includes(container)) {
                    this.isOpen = false;
                }
            },
        },
        mounted() {
            this._clickoutEvent = 'ontouchend' in document ? 'touchstart' : 'mousedown';
            document.addEventListener(this._clickoutEvent, this.handleClickOutside);
        },
        beforeDestroy() {
            document.removeEventListener(this._clickoutEvent, this.handleClickOutside);
        }
    };
</script>

<style lang="scss">

    $lightgrey: #f5f5f5;
    $grey: #e0e0e0;

    .passengers-dropdown-container{
        display: none;
        border: 1px solid $grey;
        background: white;
        border-radius: 5px;    
        width: calc(90%);
        height: auto;
        max-height: 30vh;
        padding: 0;
        margin: 1rem calc(10%/2);
        position: absolute;
        overflow: auto;

        h3{
            font-size: 1.2rem;
            font-weight: bold;
            background: white;
            padding: 0.5rem;
        }

        .passengers-dropdown-rows{
            background: white;
            border: 1px solid $lightgrey;
            border-width:0 1px 1px;
            cursor: pointer;
            display: block;
            transition: background 0.2s ease-out;
            top:0;
            left:0;
            width:100%;
            padding: 10px 30px;
            
            .passengers-dropdown-row{
                margin-bottom: 1rem;
            }
           
            &.clusterParent{
                font-weight: bold;
            }
            
            span.subtitle{
                font-size: 0.7rem;
                color: gray; 
            }

            .passengers-plus-minus{    
                border: 2px solid black;
                border-radius: 15px;
                width: 30px;
                height: 30px;
                text-align: center;
                padding: 0.1rem;
                margin:0 auto;
                cursor: pointer;
            }
            .passengers-plus-minus.disabled{    
                opacity:0.5;
                cursor:auto;
            }
        }
        &.open{
            display: block;
        }
    }
</style>