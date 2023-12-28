import {
  $,
  implicit$FirstArg,
  type QRL,
  _getContextElement,
  _serializeData,
  useOnWindow,
} from "@builder.io/qwik";

export const useClientQrl = function (qrl: QRL) {
  useOnWindow("DOMContentLoaded", qrl);
};

export const useClient$ = implicit$FirstArg(useClientQrl);
