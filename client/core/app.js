define([
    'hr/hr',
    'utils/url',
    'core/box',
    'core/session',
    'core/addons',
    'core/box'
], function (hr, url, box, session, addons, box) {

    // Define base application
    var Application = hr.Application.extend({
        name: "Codebox",
        template: "main.html",
        metas: {
            "description": "Cloud IDE on a box."
        },
        links: {
            "icon": hr.Urls.static("images/favicon.png")
        },
        events: {
            "submit .login-box form": "actionLoginBox"
        },

        // Constructor
        initialize: function() {
            Application.__super__.initialize.apply(this, arguments);

            box.on("status", function(state) {
                this.$(".codebox-connexion-alert").toggle(!state);
            }, this);
            return this;
        },

        // Template rendering context
        templateContext: function() {
            var queries = url.parseQueryString();
            return {
                'email': queries.email || hr.Storage.get("email"),
                'token': queries.token || hr.Storage.get("token"),
            };
        },

        // Finish rendering
        finish: function() {
            var that = this;

            var email = this.$(".login-box #login-email").val();
            var password = this.$(".login-box #login-token").val();

            if (email && password) {
                this.doLogin(email, password, true);
            } else if (box.isAuth()) {
                addons.loadAll().then(function() {
                    that.$(".codebox-loading-alert").remove();
                    
                    // Load new addons
                    addons.on("add", function(addon) {
                        addon.load();
                    });
                });
            }
            return Application.__super__.finish.apply(this, arguments);
        },

        // Login to box
        actionLoginBox: function(e) {
            var that = this;
            if (e) {
                e.preventDefault();
            }
            var email = this.$(".login-box #login-email").val();
            var password = this.$(".login-box #login-token").val();
            var tosave = this.$(".login-box #login-save").is(":checked");

            this.doLogin(email, password, tosave);
        },

        // Do login
        doLogin: function(email, password, tosave) {
            var that = this;

            // If no password: generate a random one
            if (!password) {
                password = Math.random().toString(36).substring(8);
            }

            return session.start(email, password).then(function() {
                if (tosave) {
                    hr.Storage.set("email", email);
                    hr.Storage.set("token", password);
                } else {
                    hr.Storage.set("email", "");
                    hr.Storage.set("token", "");
                }
                that.render();
            }).fail(function() {
                that.$(".login-box .form-group").addClass("has-error");
            });
        }
    });

    var app = new Application();
    return app;
});
