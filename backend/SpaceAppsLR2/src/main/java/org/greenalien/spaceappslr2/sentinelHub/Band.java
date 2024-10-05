package org.greenalien.spaceappslr2.sentinelHub;

/**
 * List of bands available for Landsat 8/9
 *
 * https://docs.sentinel-hub.com/api/latest/data/landsat-8-l2/
 */

public enum Band {
    B01, //	Ultra Blue (443 nm)	30m
    B02, //	Blue (482 nm)	30m
    B03, //	Green (561.5 nm)	30m
    B04, //	Red (654.5 nm)	30m
    B05, //	Near Infrared (NIR) (865 nm)	30m
    B06, //	Shortwave Infrared (SWIR) 1 (1608.5 nm)	30m
    B07, //	Shortwave Infrared (SWIR) 2 (2200.5 nm)	30m
    B08, //	Panchromatic ( 589.5 nm)	15m
    B09, //	Cirrus (1373.5 nm)	30m
    B10, //	Thermal Infrared (TIRS) 1(10895 nm)	30m [1]
    B11, //	Thermal Infrared (TIRS) 2 (12005 nm)	30m [1]
}
