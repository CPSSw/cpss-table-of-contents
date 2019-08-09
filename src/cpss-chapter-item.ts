/**
 * @license 
 * Copyright (c) 2019 XGDFalcon®. All Rights Reserved.
 * This code may only be used under the MIT style license found at https://github.com/CPSSw/cpss-table-of-contents/blob/master/LICENSE
 */

import { LitElement, html, css, customElement, property, TemplateResult } from 'lit-element';
import { CPSSPageItem, CPSSChapter } from './cpss-page-item';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
/**
 * `cpss-table-of-contents`
 * Provides a table of contents for use in a document library or other such use.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
@customElement('cpss-chapter-item')
export class CPSSChapterItem extends LitElement {

  /** Determines if the submenu is visible */
  @property({ type: Boolean }) _hidden = true;
  /** Holds chapter information for this element */
  @property({ type: CPSSChapter }) chapter;
  /** Holds the sections of this chapter */
  @property({ type: Array }) sections = []
  /** Icon for closed folder */
  @property({ type: String }) closed = 'icons:folder';
  /** Icon for open folder */
  @property({ type: String }) opened = 'icons:folder-open';
  /** Icon for links */
  @property({ type: String }) linkicon = 'icons:icons:link';

  static styles = css`
      :host {
        display: block;
        @apply --layout-vertical;
        z-index: 0;
      }

      #content {
        @apply --layout-horizontal;
        @apply --layout-start-justified;
      }

      .title {
        @apply --layout-flex;
        font-size: var(--toc-font-size, 1em);
        height: auto;
        min-height: 1em;
      }

      a {
        font-size: var(--toc-font-size, 1em);
        text-decoration: none;
        height: auto;
        min-height: 1em;
      }

      #submenu {
        padding-left: 2ch;
        display: table-cell;
        @apply --layout-vertical;
      }

      iron-icon {
        margin-right: 1ch;
        --iron-icon-width: 36px;
        --iron-icon-height: 36px;
        --iron-icon-fill-color: var(--app-dark-primary-color, #000);
        --iron-icon-stroke-color: var(--app-dark-primary-color, #000);
      }

      #content.selected {
        background-color: var(--app-primary-color, #AA0);
      }

      #content.selected iron-icon {
        --iron-icon-fill-color: var(--app-lite-primary-color, #fff);
        --iron-icon-stroke-color: var(--app-lite-primary-color, #fff);
      }

      #content.selected .title {
        color: var(--light-text-color, #fff);
        font-weight: bold;
      }`;

  render(): TemplateResult {
    return html`
    <div id="content" on-click="_toggleVisibility">
      <iron-icon icon$="{{_getIcon(_hidden)}}"></iron-icon>
      <span id="chaptername" class="title">[[chapter.Title]]</span>
    </div>
<!--    <paper-tooltip animation-delay="200" for="chaptername" position="top">[[chapter.Title]]</paper-tooltip> -->
    <cpss-collapse id="submenu">
      <span>LOADING...</span>
    </cpss-collapse>`};

  /**
 * Handle a table of contents search
 *
 * @param {String} term
 */
  HandleSearch(term, level) {
    if (level) {
      // search children
      for (var x = 0; x < this.sections.length; x++) {
        var section = this.sections[x];
        if (section.tagName.toUpperCase() === 'CPSS-PAGE-ITEM') {
          section.HandleSearch(term);
        }
      }
    }
  }

  /**
   * Select this element if the title matches
   * @param {String} title 
   */
  SelectChapter(title, level) {
    if (level) {
      // search children
      for (var x = 0; x < this.sections.length; x++) {
        var section = this.sections[x];
        if (section.tagName.toUpperCase() === 'CPSS-CHAPTER-ITEM') {
          section.SelectChapter(title);
        }
      }

    }
    if (title === this.chapter.Title) {
      this.className = "selected";
      this._openParent();
    } else {
      this.className = "";
    }
  }

  /**
   * Select a particular link
   *
   * @param {String} link
   */
  SelectLink(link, level) {
    // search children
    if (level) {
      for (var x = 0; x < this.sections.length; x++) {
        var section = this.sections[x];
        section.SelectLink(link);
      }
    }
  }

  /**
   * Internal Use Only
   */
  _openParent() {
    this.ShowMenu(true, false);
    if (this.parentNode.parentNode) {
      (this.parentNode.parentNode as CPSSChapterItem)._openParent();
    }
  }

  /**
   * Opens or closes based on the toggle switch
   *
   * @param {boolean} open
   * @param {boolean} level
   */
  ShowMenu(open: boolean, level: boolean) {
    if (level) {
      for (var x = 0; x < this.sections.length; x++) {
        var section = this.sections[x];
        if (section.tagName.toUpperCase() === 'CPSS-CHAPTER-ITEM') {
          section.ShowMenu(open);
        }
      }
    }
    this._hidden = !open;
  }

  /**
   * Get the proper icon if the submenu is visible/invisible
   *
   * @param {Boolean} hidden
   */
  _getIcon(hidden) {
    return hidden ? this.closed : this.opened;
  }

  /**
   * Handles button press to show/hide the submenu
   *
   * @param {Event} event
   */
  _toggleVisibility(event) {
    this._hidden = !this._hidden;
  }

  /**
  * Process a chapter.
  * @param {cpssChapter} chapter
  */
  processChapter(chapter, toplevel) {
    this.chapter = new CPSSChapter(chapter);
    if (CPSSChapter.exists(chapter.Chapters)) {
      afterNextRender(this, function () {
        this.$.submenu.innerHTML = "";
        for (var x = 0; x < chapter.Chapters.length; x++) {
          if (CPSSChapter.exists(chapter.Chapters[x].Link)) {
            var link: CPSSPageItem = document.createElement("cpss-page-item") as CPSSPageItem;
            link.linkicon = this.linkicon;
            link.processChapter(chapter.Chapters[x]);
            this.$.submenu.appendChild(link);
            this.push('sections', link);
          } else {
            var menu: CPSSChapterItem = document.createElement("cpss-chapter-item") as CPSSChapterItem;
            menu.closed = this.closed;
            menu.opened = this.opened;
            menu.linkicon = this.linkicon;
            menu.processChapter(chapter.Chapters[x], true);
            this.$.submenu.appendChild(menu);
            this.push('sections', menu);
          }
        }
      });
    }
  }

}