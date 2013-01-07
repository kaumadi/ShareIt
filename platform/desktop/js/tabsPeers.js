function TabsPeers(tabsId)
{
    var home = $("#Home")

    var tabs = $("#"+tabsId)

    tabs.tabs(
    {
        activate: function(event, ui)
        {
            home.detach()
        },

        active: false,
        collapsible: true,
        disabled: true
    })

    this.openOrCreate = function(uid, preferencesDialogOpen, peersManager, channel)
    {
        var tabPanelId = '#'+tabsId+'-'+uid

        // Get index of the peer tab
        var index = tabs.find('table').index($(tabPanelId))

        // Peer tab exists, open it
        if(index != -1)
            tabs.tabs("option", "active", index);

        // Peer tab don't exists, create it
        else
        {
            // Tab
            var li = document.createElement("LI");

            var a = document.createElement("A");
                a.href = tabPanelId
                a.appendChild(document.createTextNode("UID: "+uid))
            li.appendChild(a);

            var span = document.createElement("SPAN");
                span.setAttribute('class', "ui-icon ui-icon-closethick")
                span.appendChild(document.createTextNode("Remove Tab"))
                span.onclick = function()
                {
                    channel.fileslist_disableUpdates();

                    // Remove the tab
                    var index = $("#ui-corner-top", tabs).index($(this).parent());
                    tabs.find(".ui-tabs-nav li:eq("+index+")").remove();

                    // Remove the panel
                    $(tabPanelId).remove();

                    // If there are no more peer/search tabs, check if we are
                    // sharing or downloading a file and if not, show again the
                    // Home screen
                    var disabled = $("#"+tabsId).tabs("option", "disabled")
//                    if(!index && disabled.length == 2)
                    if(disabled.length == 2)
                    {
                        $("#"+tabsId).tabs("option", "collapsible", true);
                        home.appendTo("#"+tabsId);
                    }

                    // Refresh the tabs widget
                    tabs.tabs("refresh");
                }
            li.appendChild(span);

            $(li).appendTo("#"+tabsId+" .ui-tabs-nav");

            // Tab panel
            var tabPeer = new TabPeer(uid, tabsId, preferencesDialogOpen,
            function(fileentry)
            {
                return function()
                {
                    policy(function()
                    {
                        // Begin transfer of file
                        peersManager._transferbegin(fileentry)

                        // Don't buble click event
                        return false;
                    })
                }
            })

            peersManager.addEventListener("transfer.begin", function(event)
            {
                var fileentry = event.data[0]

                tabPeer.dispatchEvent({type: fileentry.hash+".begin"})
            })
            peersManager.addEventListener("transfer.update", function(event)
            {
                var fileentry = event.data[0]
                var value = event.data[1]

                tabPeer.dispatchEvent({type: fileentry.hash+".update",
                                       data: [value]})
            })
            peersManager.addEventListener("transfer.end", function(event)
            {
                var fileentry = event.data[0]

                tabPeer.dispatchEvent({type: fileentry.hash+".end"})
            })

            // Get notified when this channel files list is updated
            // and update the UI peer files table
            channel.addEventListener("fileslist._updated", function(event)
            {
                var fileslist = event.data[0]

                tabPeer.update(fileslist)
            })

            // Request the peer's files list
            var SEND_UPDATES = 1
//            var SMALL_FILES_ACCELERATOR = 2

            var flags = SEND_UPDATES
//            if()
//                flags |= SMALL_FILES_ACCELERATOR

            channel.fileslist_query(flags);
        }
    }
}