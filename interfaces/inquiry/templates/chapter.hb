<div class="chapter" id="{{id}}" data-int-id="{{id}}" data-page="{{page}}">
  <div class="title">
    <div class="table">
      <div class="number toggle-preview">{{{chapter_number number}}}</div>
      <div class="text toggle-preview"><p>{{content}}</p></div>
    </div>
  </div>
  <div class="subtitles">
  {{#each subheadings}}
    <div class="subtitle" id="{{id}}" data-page="{{page}}">
      <div class="table">
        <div class="text toggle-preview"><p>{{{decorate content}}}</p></div>
        {{!-- <div class="icon icon-toggle-preview toggle-preview"></div> --}}
        {{!-- <div class="action set-leader"><i class="fa fa-thumb-tack"></i></div> --}}
      </div>
      <div class="paragraphs">
        <div class="pusher"></div>
        {{#each paragraphs}}
          <div class="paragraph" id="{{id}}" data-page="{{page}}">
          <span class="number">- {{number}} -</span>
          <div class="ex-actions">
          <div class="anchor"><i class="icon-link"></i></div>
          </div>
          <div class="bookmarklet"><i class="icon-bookmark"></i></div>
          <div class="content">{{#if slices.length }}{{{parse slices}}}{{else}}{{{decorate content}}}{{/if}}</div></div>
        {{/each}}
        <div class="pusher"></div>
        <!-- div class="ellipsis">
          <div class="ellipsis-inner left read-more"><span>{{t "preview"}}</span></div>
          <div class="ellipsis-inner right explore action set-leader slave-keep"><span>[ {{t "explore"}} ]</span></div>
        </div -->
        <div class="actions slave-keep">
          <div class="shadow"></div>
          <div class="wrapper">
            <div class="action left">
              <p class="read-more">{{t "preview" }}</p>
              <p class="read-less">{{t "collapse" }}</p>
            </div>
            <div class="action right">
              <p class="set-leader">{{t "explore"}}</p>
            </div>
            <div class="action middle slave-keep">
              <p class="set-leader">{{t "explore" }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {{/each}}
  </div>
</div>