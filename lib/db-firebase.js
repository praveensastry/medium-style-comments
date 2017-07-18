
module.exports = DBFirebase

function DBFirebase(options) {
  var config = {
    apiKey: "AIzaSyCZlOO4DVD2G1iejBTGrS6P47etHYbYzfk",
    authDomain: "medium-style-comments.firebaseapp.com",
    databaseURL: "https://medium-style-comments.firebaseio.com",
    projectId: "medium-style-comments",
    storageBucket: "medium-style-comments.appspot.com",
    messagingSenderId: "835019619612"
  };
  firebase.initializeApp(config);
  this.db = firebase.database().ref('comments/' + options.slug);
  var onValue
  this.db.on('value', onValue = function () {
    this.db.off('value', onValue)
    this.loaded = true
  }.bind(this));
  this.user = null
  this.options = options
  this._auth = firebase.auth()
  this.liHanders = []
  this._auth.onAuthStateChanged(function(user) {
    if(user) {
      this.user = user
      this._onLogin(null, user)
    }
    else {
      this.user = null;
    }
  }.bind(this))
}

DBFirebase.prototype = {

  // normal edits
  addComment: function (text, target, quote) {
    if (!this.user) {
      return console.error("Not logged in");
    }
    this.db.push({
      created: Date.now(),
      displayName: this.user.displayName,
      picture: this.user.picture,
      userid: this.user.uid,
      text: text,
      target: target,
      quote: quote
    })
  },

  editComment: function (id, text) {
    if (!this.user) {
      return console.error("Not logged in");
    }
    this.db.child(id).update({text: text})
  },

  removeComment: function (id) {
    if (!this.user) {
      return console.error("Not logged in");
    }
    this.db.child(id).remove()
  },

  // voting!!

  flag: function (id, uid, flag) {
    if (flag) {
      this.db.child(id).child('flags').child(uid).set(flag)
    } else {
      this.db.child(id).child('flags').child(uid).remove()
    }
  },

  heart: function (id, uid) {
    this.db.child(id).child('votes').child(uid).set(true)
  },

  unHeart: function (id, uid) {
    this.db.child(id).child('votes').child(uid).remove()
  },

  login: function () {
    this._auth.signInAnonymously()
  },

  logout: function () {
  this._auth.signOut()
  },

  _onLogin: function (err, user) {
    if (err || !user) {
      return this.fireLoggedin(null)
    }
    user.picture = ""
    this.user = user
    this.fireLoggedin(user)
  },

  fireLoggedin: function (user) {
    this.liHanders.forEach(function (fn) {
      fn(user)
    })
  },

  onLogin: function (cb) {
    this.liHanders.push(cb)
  },

  offLogin: function (cb) {
    var i = this.liHanders.indexOf(cb)
    if (i === -1) return
    this.liHanders.splice(i, 1)
  },

  onceLoaded: function (done) {
    var onValue
    this.db.on('value', onValue = function () {
      done()
      this.db.off('value', onValue)
    }.bind(this))
  },

  // register event listeners
  onAdd: function (cb) {
    this.db.on('child_added', function (snapshot) {
      var val = snapshot.val()
      val._id = snapshot.key
      cb(val);
    });
  },
  onChange: function (cb) {
    this.db.on('child_changed', function (snapshot) {
      var val = snapshot.val()
      val._id = snapshot.key
      cb(val)
    });
  },
  onRemove: function (cb) {
    this.db.on('child_removed', function (snapshot) {
      cb(snapshot.key);
    });
  },
}
