/**
 * @license 
 * Copyright (c) 2019 XGDFalcon®. All Rights Reserved.
 * This code may only be used under the MIT style license found at https://github.com/CPSSw/cpss-table-of-contents/blob/master/LICENSE
 */

import { LitElement, html, css, customElement, property, TemplateResult } from 'lit-element';
import { Icon } from "@material/mwc-icon"


export class CPSSChapter {
  @property({ type: String }) Title = '';
  @property({ type: Array<CPSSChapter>() }) Chapters = [];
  @property({ type: String }) Link = '';

  constructor(source: CPSSChapter) {
    if (CPSSChapter.exists(source)) {
      this.Title = source.Title;
      this.Chapters = source.Chapters;
      this.Link = source.Link;
    } else {
      this.Title = "NO TITLE";
      this.Chapters = [];
      this.Link = ""
    }
  }
  /** Get an identifier for this chapter object */
  GetIdentifier() {
    if (CPSSChapter.exists(this.Link)) {
      var start = this.Link.lastIndexOf('/') + 1;
      var end = this.Link.length;
      var link = this.Link.replace("#", "");
      return link.substring(start, end);
    } else {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
  }
  /** Compare this object with a specific term */
  Compare(term) {
    if (CPSSChapter.exists(this.Link)) {
      return this.Title.toUpperCase().indexOf(term.toUpperCase()) !== -1;
    } else {
      return true;
    }
  }
  /** 
   * Determines if the object actually exists
   *
   * @param Object item
   */
  static exists(item) {
    return (typeof (item) !== 'undefined' && item !== null && item !== "");
  }
};

/**
 * `cpss-page-item`
 * Provides a table of contents for use in a document library or other such use.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
@customElement('cpss-page-item')
export class CPSSPageItem extends LitElement {

  /** Determines if the submenu is visible */
  @property({ type: Boolean }) _hidden = true;
  /** Holds chapter information for this element */
  @property({ type: CPSSChapter }) chapter;
  /** Icon for links */
  @property({ type: String }) linkicon = 'icons:link';

  static styles = css`
    :host {
      display: block;
      z-index: 0;
    }
    #content {
      @apply--layout-horizontal;
      @apply--layout-start-justified;
      cursor: pointer;
      background-color: transparent;
      color: var(--primary-text-color, #000);
      font-style: normal;
    }
    .title {
      @apply--layout-flex;
      font-size: var(--toc-font-size, 1em);
      text-decoration: none;
      height: auto;
      min-height: 1em;
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

    #content.selected.title {
      color: var(--light-text-color, #fff);
      font-weight: bold;
    }`;

  render(): TemplateResult {
    return html`
  <div id="content" >
    <mwc-icon id="icon">${this.linkicon}</mwc-icon>
    <span id="pagename" class="title">${this.chapter.Title}</span>
  </div>
<!--  <paper-tooltip animation-delay="200" for="pagename" position="top">${this.chapter.Title}</paper-tooltip> -->
     `};

  constructor() {
    super();
  }

  firstUpdated(changedProperties): void {
    this.addEventListener('click', this._handleClick.bind(this));
  }

  /**
   * Select this element if the link matches
   * @param {String} link 
   */
  SelectLink(link) {
    if (link === this.chapter.Link) {
      this.className = "selected";
      // if (this.parentNode.parentNode.host) {
      //   this.parentNode.parentNode.host._openParent();
      // }
    } else {
      this.className = "";
    }
  }
  /**
   * Handle clicking this item
   *
   * @param {String} term
   */
  _handleClick(event) {
    var chapter = new CPSSChapter(this.chapter);
    window.dispatchEvent(new CustomEvent("cpss-page-selection", { detail: chapter, bubbles: true }));
  }

  /**
   * Handle a table of contents search
   *
   * @param {String} term
   */
  HandleSearch(term) {
    if (!this.chapter.Compare(term)) {
      this.style.display = "none";
    } else {
      this.style.display = "block";
    }
  }

  /**
  * Process a chapter.
  * @param {cpssChapter} chapter
  */
  processChapter(chapter) {
    this.chapter = new CPSSChapter(chapter);
  }
}