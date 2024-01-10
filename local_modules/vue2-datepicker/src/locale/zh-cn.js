/* 
    SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
    SPDX-License-Identifier: AGPL-3.0-or-later 
*/
import DatePicker from 'vue2-datepicker';
import zhCN from 'date-format-parse/lib/locale/zh-cn';

const lang = {
  formatLocale: zhCN,
  yearFormat: 'YYYY年',
  monthFormat: 'MMM',
  monthBeforeYear: false,
};

DatePicker.locale('zh-cn', lang);

export default lang;
