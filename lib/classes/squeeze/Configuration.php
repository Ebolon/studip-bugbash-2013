<?php
/*
 *
 * Copyright (c) 2011  <mlunzena@uos.de>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of
 * the License, or (at your option) any later version.
 */

namespace Studip\Squeeze;


class Configuration implements \ArrayAccess
{

    function __construct($conf = array(), $path = NULL)
    {

        global $ABSOLUTE_PATH_STUDIP, $ABSOLUTE_URI_STUDIP;

        $defaults = array(

            'assets_root'  => "${ABSOLUTE_PATH_STUDIP}assets",

            # TODO richtiger Pfad?
            'package_path' => "${ABSOLUTE_PATH_STUDIP}assets/squeezed",
            'package_url'  => "${ABSOLUTE_URI_STUDIP}assets/squeezed",

            'javascripts'  => array(),
            'compress'     => true,

            'compressor_options' => array()
        );

        $this->settings = array_merge($defaults, $conf);

        # TODO eigentlich immer nur aus einer Datei und nicht als array?
        #      gegenwärtig Pfad nötig, um filemtime zu bestimmen
        $this->settings['config_path'] = $path ?: __FILE__;
    }

    function offsetExists($offset)
    {
        return array_key_exists($offset, $this->settings);
    }

    function offsetGet($offset)
    {
        return @$this->settings[$offset] ;
    }

    function offsetSet($offset, $value)
    {
        if (array_key_exists($offset, $this->settings)) {
            $this->settings[$offset] = $value;
        }
    }

    function offsetUnset($offset)
    {
        throw new RuntimeException("Unsetting properties forbidden");
    }

    static function load($path)
    {
        ob_start();
        require $path;
        $config = ob_get_clean();

        require_once 'vendor/yaml/lib/sfYamlParser.php';
        $yaml = new \sfYamlParser();
        return new Configuration($yaml->parse($config), $path);
    }
}