/**
 * @license 
 * Copyright (c) 2019 XGDFalcon®. All Rights Reserved.
 * This code may only be used under the MIT style license found at https://github.com/CPSSw/cpss-table-of-contents/blob/master/LICENSE
 */

import { LitElement, html, css, customElement, property, query } from 'lit-element';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { CPSSChapter, CPSSPageItem } from './cpss-page-item';
import { CPSSChapterItem } from './cpss-chapter-item';
/**
 * `cpss-table-of-contents`
 * Provides a table of contents for use in a document library or other such use.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
@customElement('cpss-table-of-contents')
class CPSSTableOfContents extends LitElement {
  @property()
  _searchTerm: string;
  @property()
  _tableOfContents: Array<any>;
  @property()
  closed: string = "folder";
  @property()
  opened: string = "icons-folder-open";
  @property()
  linkicon: string = "icons:link";

  @query('#toc')
  private toc?: Element;

  static styles = css`
    :host {
      display: block;
    }
    #toc {
      @apply --layout-vertical;
      @apply --layout-start-justified;
    }`;

  /**
   * Fired when a user selects a page.
   * @event cpss-page-selection
   * @param {Event} event 
   *
   * The structure of the event is as follows:
   * @param {Object} detail {
   *      @param {String} Title The title of the page
   *      @param {String} Link Link to the page.
   * }
   */

  constructor() {
    super();
    afterNextRender(this, () => {
      window.addEventListener("cpss-page-selection", (event: any) => {
        this.SelectPage(event.detail.Link);
      });
    });
  }
  // Render element DOM by returning a `lit-html` template.
  render() {
    return html`
    <div class="content">
      <div class="search">
        <paper-input label="Search Contents" value="{{_searchTerm}}">
          <iron-icon icon="icons:search" slot="prefix"></iron-icon>
          <iron-icon icon="icons:clear" slot="suffix" on-click="_clearSearch"></iron-icon>
        </paper-input>
      </div>
      <div class="container">
        <paper-toggle-button checked on-click="_handleToggle">[[toggleState]]</paper-toggle-button>
        <div id="toc">
        </div>
      </div>
    </div>
    `;
  }

  /**
  * Clear the search box.
  * @param {Event} event
  */
  _clearSearch(event) {
    this._searchTerm = '';
  }
  /**
  * Search the table of contents.
  * @param {String} term
  */
  _searchTable(term) {
    for (var x = 0; x < this._tableOfContents.length; x++) {
      if (this._tableOfContents[x].HandleSearch) {
        this._tableOfContents[x].HandleSearch(term, true);
      }
    }
  }
  /**
  * Select a particular page.
  * @param {String} pagelink
  */
  SelectPage(pagelink) {
    for (var x = 0; x < this._tableOfContents.length; x++) {
      if (this._tableOfContents[x].SelectLink) {
        this._tableOfContents[x].SelectLink(pagelink, true);
      }
    }
  }
  /**
  * Select a particular chapter.
  * @param {String} title
  */
  SelectChapter(title) {
    for (var x = 0; x < this._tableOfContents.length; x++) {
      if (this._tableOfContents[x].SelectChapter) {
        this._tableOfContents[x].SelectChapter(title, true);
      }
    }
  }
  /**
  * Handles the even from the toggle button.
  * @param {Event} event
  */
  _handleToggle(event) {
    var open = event.target.checked;
    this._toggleMenu(open);
  }
  /**
  * Toggle expand/collapse of the table of contents.
  * @param {Event} event
  */
  _toggleMenu(open) {
    for (var x = 0; x < this._tableOfContents.length; x++) {
      if (this._tableOfContents[x].ShowMenu) {
        this._tableOfContents[x].ShowMenu(open, true);
      }
    }
  }
  /**
  * Set the Table Of Contents Data.
  * @param {Object}(XGDChapter) toc
  */
  LoadTableOfContents(toc) {
    if (typeof (toc) !== "undefined" && typeof (toc.Chapters) !== "undefined") {
      this.toc.innerHTML = "";
      for (var x = 0; x < toc.Chapters.length; x++) {
        if (CPSSChapter.exists(toc.Chapters[x].Link)) {
          var link = document.createElement("cpss-page-item") as CPSSPageItem;
          link.linkicon = this.linkicon;
          link.processChapter(toc.Chapters[x]);
          this.toc.append(link);
          this._tableOfContents.push(link);
        } else {
          var chapter = document.createElement("cpss-chapter-item") as CPSSChapterItem;
          chapter.closed = this.closed;
          chapter.opened = this.opened;
          chapter.linkicon = this.linkicon;
          chapter.processChapter(toc.Chapters[x], false);
          this.toc.append(chapter);
          this._tableOfContents.push(chapter);
        }
      }
      afterNextRender(this, function () {
        this._toggleMenu(false);
      });
    }
  }

}