Module.register('MMM-Subreddit-Posts', {
  defaults: {
    updateInterval: 1000 * 60 * 10,
    maxTitleLength: 100,
    postCount: 10,
    subReddit: 'portainer',
    sort: 'created',
    direction: 'desc',
  },

  getStyles: function () {
    return [
      this.file('MMM-Subreddit-Posts.css'),
      'font-awesome.css'
    ];
  },

  start: function () {
    Log.log('Starting module: ' + this.name);
    var self = this;
    setTimeout(function() {
      self.updateCycle();
    }, 2000);
    setInterval(function() {
      self.updateCycle();
    }, self.config.updateInterval);
  },

  updateCycle: async function () {
    this.redditData = [];
    await this.updateData();
    this.updateDom();
  },

  updateData: async function () {
    const resPosts = await fetch(`https://www.reddit.com/r/${this.config.subReddit}/.json?limit=${this.config.postCount}`);
    const subData = {
      title: `r/${this.config.subReddit}`,
    }
    if (resPosts.ok) {
      let jsonPosts = await resPosts.json();
      if (this.config.maxTitleLength) {
        jsonPosts.data.children.forEach(post => {
          if (post.data.title.length > this.config.maxTitleLength) {
            post.data.title = post.data.title.substr(0, this.config.maxTitleLength) + '...';
          }
        });
      }
      subData.posts = jsonPosts.data.children;
    }
    this.redditData.push(subData);
  },

  getHeader: function () {
    return this.data.header + `: r/${this.config.subReddit}`;
  },

  getDom: function () {
    let table = document.createElement('table');
    table.classList.add('reddit-posts');

    if (this.redditData) {
      var post = [];
      for (var i = 0; i < this.config.postCount; i++) {
          post = this.redditData[0].posts[i];
          const postRow = document.createElement('tr');
          const postEntry = document.createElement('td');
          postEntry.style.paddingLeft = '1em';
          postEntry.colSpan = 2;
          postEntry.innerText = `${post.data.title}`;
          postRow.append(postEntry);
          const postComments = document.createElement('td');
          postComments.style.paddingRight = '1em';
          postComments.colspan = 1;
          postComments.innerHTML = `${post.data.num_comments} <i class="far fa-comment-alt"></i>`;
          postRow.append(postComments);
          table.append(postRow);
      }
    }

    return table;
  }
});