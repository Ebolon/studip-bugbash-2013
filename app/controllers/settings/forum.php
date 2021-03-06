<?php
/**
 * SettingsController - Administration of all user forum related
 * settings
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of
 * the License, or (at your option) any later version.
 *
 * @author      Jan-Hendrik Willms <tleilax+studip@gmail.com>
 * @license     http://www.gnu.org/licenses/gpl-2.0.html GPL version 2
 * @category    Stud.IP
 * @since       2.4
 */

require_once 'settings.php';

class Settings_ForumController extends Settings_SettingsController
{
    /**
     * Set up this controller. Rewrites $action on verification.
     *
     * @param String $action Name of the action to be invoked
     * @param Array  $args   Arguments to be passed to the action method
     */
    public function before_filter(&$action, &$args)
    {
        if ($action === 'verify') {
            $action = 'index';
        }

        parent::before_filter($action, $args);

        PageLayout::setHelpKeyword('Basis.MyStudIPForum');
        PageLayout::setTitle(_('Einstellungen des Forums anpassen'));
        PageLayout::setTabNavigation('/links/settings');
        Navigation::activateItem('/links/settings/forum');

        SkipLinks::addIndex(_('Einstellungen des Forums anpassen'), 'layout_content', 100);

        $settings = $this->config->FORUM_SETTINGS ?: array();

        $this->defaults = array(
            'sortthemes' => 'asc',
            'themeview'  => 'tree',
            'presetview' => 'tree',
        );
        foreach ($this->defaults as $key => $value) {
            if (!isset($settings[$key])) {
                $settings[$key] = $value;
            }
        }

        $this->settings = $settings;
    }

    /**
     * Displays the forum settings of a user.
     *
     * @param mixed $verify_action Optional name of an action to be verified
     */
    public function index_action($verify_action = null)
    {
        $this->verify_action = $verify_action;
    }

    /**
     * Stores the forum settings of a user.
     */
    public function store_action()
    {
        $this->check_ticket();

        $presetview = Request::option('presetview');
        if ($presetview == 'theme') {
            $presetview = Request::option('themeview');
        }

        $forum = array(
            'neuauf'      => Request::int('neuauf'),
            'rateallopen' => Request::option('rateallopen'),
            'showimages'  => Request::option('showimages'),
            'sortthemes'  => Request::option('sortthemes'),
            'themeview'   => Request::option('themeview'),
            'presetview'  => $presetview,
            'shrink'      => Request::int('shrink') * 7 * 24 * 60 * 60, // = 1 Woche
        );

        $this->config->store('FORUM_SETTINGS', $forum);
        $this->reportSuccess(_('Ihre Einstellungen wurden gespeichert.'));
        $this->redirect('settings/forum');
    }

    /**
     * Resets the forum settings of a user.
     *
     * @param bool $verified Indicates whether the action has been verified.
     */
    public function reset_action($verified = true)
    {
        if ($verified) {
            $this->check_ticket();

            $this->config->delete('FORUM_SETTINGS');

            $this->reportSuccess(_('Ihre Einstellungen wurden zur�ckgesetzt.'));
        }

        $this->redirect('settings/forum');
    }
}
