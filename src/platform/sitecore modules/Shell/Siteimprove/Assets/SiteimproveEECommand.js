
define(["sitecore","/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.SiteImproveRecheck =
  {
    canExecute: function(context, sourceControl) {
        return true;
    },

    execute: function(context) {
       
        var token = "";
        var liveurl = "";


        ExperienceEditor.PipelinesUtil.generateRequestProcessor("Siteimprove.GetToken", function (response) {
            token = response.responseValue.value;
            
        }, context.currentContext).execute(context);

        

        ExperienceEditor.PipelinesUtil.generateRequestProcessor("Siteimprove.GetLiveUrl", function (response) {
            liveurl = response.responseValue.value;
           
        }, context.currentContext).execute(context);

        parent.SiteImproveRecheck(liveurl, token);
        
    }};
});



define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
    
    Sitecore.Commands.SiteImproveContentCheck =
    {
        canExecute: function (context, sourceControl) {
            return true;
        },

        execute: function (context) {

            var token = "";
            var previewurl = "";
            var liveurl = "";
            var contentCheckEnabled = false;


            ExperienceEditor.PipelinesUtil.generateRequestProcessor("Siteimprove.GetToken", function (response) {
                token = response.responseValue.value;
            }).execute(context);

            ExperienceEditor.PipelinesUtil.generateRequestProcessor("Siteimprove.GetPreviewUrl", function (response) {
                previewurl = response.responseValue.value;
            }).execute(context);

            ExperienceEditor.PipelinesUtil.generateRequestProcessor("Siteimprove.GetLiveUrl", function (response) {
                liveurl = response.responseValue.value;
            }).execute(context);


            ExperienceEditor.PipelinesUtil.generateRequestProcessor("Siteimprove.GetContentCheckStatus", function (response) {
                contentCheckEnabled = response.responseValue.value;
            }).execute(context);
            
            
            if (contentCheckEnabled === false) {
                alert("Sorry, it looks like there is a problem\n\nIt was caused by one of two issues:\n\n- You do not have Prepublish as part of your subscription\n- You do have Prepublish but you need to validate your API key and username in Settings");
                return;
            }

            var saveItemCallback = function (doSave) {
                if (!doSave) {
                    return;
                }

                ExperienceEditor.RibbonApp.getApp().disableRedirection = true;
                Sitecore.Commands.Save.execute(ExperienceEditor.RibbonApp.getAppContext());
                ExperienceEditor.Common.addOneTimeEvent(function () {
                    return !ExperienceEditor.getContext().isModified;
                }, function () {

                    if (previewurl != "" && liveurl != "" && token != "") {
                        parent.SiteImproveContentCheck(previewurl, liveurl, token);
                    }
                    
                }, 100, this);
                
                return;
            };


            if (ExperienceEditor.getContext().isModified) {
                ExperienceEditor.Dialogs.confirm("Do you want to save the changes to the item?", saveItemCallback, "OK", "cancel", "item changed", "500", "200", "400", "400");
            } else {
                if (previewurl != "" && liveurl != "" && token != "") {
                    parent.SiteImproveContentCheck(previewurl, liveurl, token);
                }
            }

            
            

        }

    }
});