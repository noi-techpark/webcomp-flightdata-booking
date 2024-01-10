<!--  
    SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
    SPDX-License-Identifier: AGPL-3.0-or-later  
-->
<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[
      `${prefixClass}-btn ${prefixClass}-btn-text ${prefixClass}-btn-icon-${type}`,
      {
        disabled: disabled,
      },
    ]"
    v-on="$listeners"
  >
    <i :class="`${prefixClass}-icon-${type}`"></i>
  </button>
</template>

<script>
export default {
  props: {
    type: String,
    disabled: Boolean,
  },
  inject: {
    prefixClass: {
      default: 'mx',
    },
  },
};
</script>
