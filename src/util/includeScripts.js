import React from 'react';
import { Helmet } from 'react-helmet-async';

const MAPBOX_SCRIPT_ID = 'mapbox_GL_JS';
const GOOGLE_MAPS_SCRIPT_ID = 'GoogleMapsApi';

/**
 * Include scripts (like Map Provider).
 * These scripts are relevant for whole application: location search in Topbar and maps on different pages.
 * However, if you don't need location search and maps, you can just omit this component from app.js
 * Note: another common point to add <scripts>, <links> and <meta> tags is Page.js
 *       and Stripe script is added in public/index.html
 *
 * Note 2: When adding new external scripts/styles/fonts/etc.,
 *         if a Content Security Policy (CSP) is turned on, the new URLs
 *         should be whitelisted in the policy. Check: server/csp.js
 */
export const IncludeScripts = props => {
  const { marketplaceRootURL: rootURL, maps, analytics } = props?.config || {};
  const { googleAnalyticsId, plausibleDomains } = analytics;

  const { mapProvider, googleMapsAPIKey, mapboxAccessToken } = maps || {};
  const isGoogleMapsInUse = false; //mapProvider === 'googleMaps';
  const isMapboxInUse = false; // mapProvider === 'mapbox';

  // Add Google Analytics script if correct id exists (it should start with 'G-' prefix)
  // See: https://developers.google.com/analytics/devguides/collection/gtagjs
  const hasGoogleAnalyticsv4Id = googleAnalyticsId?.indexOf('G-') === 0;

  // Collect relevant map libraries
  let mapLibraries = [];
  let analyticsLibraries = [];

  if (isMapboxInUse) {
    // NOTE: remember to update mapbox-sdk.min.js to a new version regularly.
    // mapbox-sdk.min.js is included from static folder for CSP purposes.
    mapLibraries.push(
      <script key="mapboxSDK" src={`${rootURL}/static/scripts/mapbox/mapbox-sdk.min.js`}></script>
    );
    // Add CSS for Mapbox map
    mapLibraries.push(
      <link
        key="mapbox_GL_CSS"
        href="https://api.mapbox.com/mapbox-gl-js/v1.0.0/mapbox-gl.css"
        rel="stylesheet"
        crossOrigin
      />
    );
    // Add Mapbox library
    mapLibraries.push(
      <script
        id={MAPBOX_SCRIPT_ID}
        key="mapbox_GL_JS"
        src="https://api.mapbox.com/mapbox-gl-js/v1.0.0/mapbox-gl.js"
        crossOrigin
      ></script>
    );
  } else if (isGoogleMapsInUse) {
    // Add Google Maps library
    mapLibraries.push(
      <script
        id={GOOGLE_MAPS_SCRIPT_ID}
        key="GoogleMapsApi"
        src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsAPIKey}&libraries=places`}
        crossOrigin
      ></script>
    );
  }

  analyticsLibraries.push(
    <script nonce="6770d74824cc53512837f5654ab230448eb462060b125345d743c1a60c4229d5">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-TDW76S9S');`}
    </script>
  );

  if (googleAnalyticsId && hasGoogleAnalyticsv4Id) {
    // Google Analytics: gtag.js
    // NOTE: This template is a single-page application (SPA).
    //       gtag.js sends initial page_view event after page load.
    //       but we need to handle subsequent events for in-app navigation.
    //       This is done in src/analytics/handlers.js
    analyticsLibraries.push(
      <script
        key="gtag.js"
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        crossOrigin
      ></script>
    );

    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      // Ensure that gtag function is found from window scope
      window.gtag = function gtag() {
        dataLayer.push(arguments);
      };
      gtag('js', new Date());
      gtag('config', googleAnalyticsId, {
        cookie_flags: 'SameSite=None;Secure',
      });
    }
  }

  // FB script start

  // analyticsLibraries.push(
  //   <script
  //     key='fb'
  //     nonce="6770d74824cc53512837f5654ab230448eb462060b125345d743c1a60c4229d5"
  //   >
  //     {`
  //       !function(f,b,e,v,n,t,s)
  //       {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  //       n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  //       if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  //       n.queue=[];t=b.createElement(e);t.async=!0;
  //       t.src=v;s=b.getElementsByTagName(e)[0];
  //       s.parentNode.insertBefore(t,s)}(window, document,'script',
  //       'https://connect.facebook.net/en_US/fbevents.js');
  //       fbq('init', '1780513916058675');
  //       fbq('track', 'PageView');
  //     `}
  //   </script>
  // )
  // analyticsLibraries.push(
  //   <noscript key='fb-img'>{`<img height="1" width="1" style="display:none"
  //   src="https://www.facebook.com/tr?id=1780513916058675&ev=PageView&noscript=1"
  //   />`}</noscript>
  // )

  // FB script end

  if (plausibleDomains) {
    // If plausibleDomains is not an empty string, include their script too.
    analyticsLibraries.push(
      <script
        key="plausible"
        defer
        src="https://plausible.io/js/script.js"
        data-domain={plausibleDomains}
        crossOrigin
      ></script>
    );
  }

  const isBrowser = typeof window !== 'undefined';
  const isMapboxLoaded = isBrowser && window.mapboxgl;

  // If Mapbox is loaded, we can set the accessToken already here.
  // This is the execution flow with the production build,
  // since SSR includes those map libraries to <head> of the app.
  if (isMapboxInUse && isMapboxLoaded && !window.mapboxgl.accessToken) {
    // Add access token for Mapbox library
    window.mapboxgl.accessToken = mapboxAccessToken;
  }

  // If the script is added on client side as a reaction to page navigation or
  // the app is rendered on client side entirely (e.g. HMR/WebpackDevServer),
  // we need to listen when the script is loaded.
  const onMapLibLoaded = () => {
    // At this point we know that map library is loaded after it's dynamically included
    if (isMapboxInUse && !window.mapboxgl.accessToken) {
      // Add access token for Mapbox sdk.
      window.mapboxgl.accessToken = mapboxAccessToken;
    }
  };

  // React Helmet Async doesn't support onLoad prop for scripts.
  // However, it does have onChangeClientState functionality.
  // We can use that to start listen 'load' events when the library is added on client-side.
  const onChangeClientState = (newState, addedTags) => {
    if (addedTags && addedTags.scriptTags) {
      const foundScript = addedTags.scriptTags.find(s =>
        [MAPBOX_SCRIPT_ID, GOOGLE_MAPS_SCRIPT_ID].includes(s.id)
      );
      if (foundScript) {
        foundScript.addEventListener('load', onMapLibLoaded, { once: true });
      }
    }
  };

  const allScripts = [...analyticsLibraries, ...mapLibraries];
  return <Helmet onChangeClientState={onChangeClientState}>{allScripts}</Helmet>;
};
