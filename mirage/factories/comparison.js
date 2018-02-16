import {Factory, trait} from 'ember-cli-mirage';
import moment from 'moment';
import {TEST_IMAGE_DIMS, TEST_IMAGE_URLS} from 'percy-web/mirage/factories/screenshot';

const HIGH_DIFF_RATIO = 0.62;
const LOW_DIFF_RATIO = 0.42;
const NO_DIFF_RATIO = 0.0;

export default Factory.extend({
  id(i) {
    return `comparison-${i}`;
  },
  startedProcessingAt() {
    return moment().subtract(65, 'seconds');
  },
  finishedProcessingAt() {
    return moment().subtract(23, 'seconds');
  },

  width: TEST_IMAGE_DIMS.DEFAULT_WIDTH,
  diffRatio: HIGH_DIFF_RATIO,

  default: trait({
    afterCreate(comparison, server) {
      const diffRatio = LOW_DIFF_RATIO;
      const headScreenshot = server.create('screenshot');
      const baseScreenshot = server.create('screenshot', 'v1');
      const diffImage = server.create('image', {url: TEST_IMAGE_URLS.DIFF_URL});

      comparison.update({
        diffRatio,
        headScreenshot,
        baseScreenshot,
        diffImage,
      });
    },
  }),

  same: trait({
    afterCreate(comparison, server) {
      const diffRatio = NO_DIFF_RATIO;
      const headScreenshot = server.create('screenshot');
      const baseScreenshot = server.create('screenshot', 'v1');
      const diffImage = server.create('image', {url: ''});

      comparison.update({
        diffRatio,
        headScreenshot,
        baseScreenshot,
        diffImage,
      });
    },
  }),

  mobile: trait({
    afterCreate(comparison, server) {
      const width = TEST_IMAGE_DIMS.MOBILE_WIDTH;
      const headScreenshot = server.create('screenshot', 'mobile');
      const baseScreenshot = server.create('screenshot', 'v1', 'mobile');
      const diffImage = server.create('image', {
        height: TEST_IMAGE_DIMS.MOBILE_HEIGHT,
        width: TEST_IMAGE_DIMS.MOBILE_WIDTH,
        url: TEST_IMAGE_URLS.DIFF_MOBILE,
      });

      comparison.update({
        width,
        headScreenshot,
        baseScreenshot,
        diffImage,
      });
    },
  }),
});
