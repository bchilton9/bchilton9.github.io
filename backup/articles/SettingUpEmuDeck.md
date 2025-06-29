# Setting up EmuDeck

Don’t have EmuDeck installed? Head over to Installing EmuDeck.

First you’re going to need some files to get the emulators working.

Roms (the games)
Bios (code the emulators need to run games)
Prod Keys, Title Keys, and firmware (for switch emulation)
Yuzu has been taken down by Nintendo but is still supported by EmuDeck. The script will NOT install Yuzu but if you have (or can find) the appimage you can still use it. There will not be any more updates or support for it in the future so it’s “as is” and new games probably won’t work.

All of the above files are copyrighted so this guide will not cover how to obtain them just how to use them.

There are legal ways to acquire these files by making backups from the games and systems you own but this guide is again just how to use them.

EmuDeck has a rom transfer tool but I think it’s just as easy to copy them to the folder. I may cover there tool in the future.

Rom files will be placed in one of 2 locations depending if you have EmuDeck installed to the SD card or internal storage.

SD Card


In the bottom of the left panel in Dolphin File Browser there is the SDcard. It will be named differently depending on your card. Mine is LX1TB.

The Emulation folder is the one you want.

Internal storage

This will be in the Home folder on the very top of the left panel in Dolphin. There will be an Emulation folder in the home folder.


Inside the Emulation folder you will see several more folders. The one we need right now is the roms folder.


Inside the roms folder is folders for each of the different systems. These folders are where you place the rom files. Some systems will have multiple folders. Example genesis and genesiswide. This gives you some options. If you want your genesis games to play in the old style with a more square screen then choose genesis. If you want them to be the full wide screen then chose genesiswide.

Some of the folders have the small link icon like gc in the picture. This just links the gc folder to the gamecube folder. When you click on the gc folder it will open the gamecube folder.

The folders are fairly self explanatory. Example gba is GameBoy Advanced and nes is Nintendo Entertainment System.

Each folder will have a readme.txt in it that will tell you what files are supported. Some emulators support zip files and some don’t. The readme will list this. If zip files are not supported you will have to unzip them first.

Just place your rom files in each folder and you’re ready to move on.


Bios files are required by some emulators but not all of them. Some of them that don’t require them still work better with them. There are RetroArch bios packs available that have most everything and you can just unzip them and place them in the bios folder.


The RetroArch bios pack will not have the files needed for switch games.

Prod.keys
Title.keys
Firmware

Yuzu and Ryujinx folders have a keys folder and firmware folder. place your prod.keys and title.keys into the keys folder. Unzip your firmware and place all the contents of the zip file in the firmware folder.

As of March 2024 the 17.0.0 firmware keys and titles are the newest. However with the firmware experienced a major slowdown in games with the 17.0.0 firmware. Therefore I recommend using the 17.0.0 keys and titles but the 16.1.0 firmware. You can always try the new version and if it doesn’t work just delete everything in the firmware folder and download a different version.

When you have all your bios files in place you can test them inside of EmuDeck by clicking on the Bios files checker. They should all turn green.


Now we can move on to actually adding games to the Steam Decks game mode.

Open up EmuDeck from the icon on your desktop.

There is a lot of options here and I will cover what they do but I’m going to start with cloud services because after changing anything in the cloud services you have to run Steam ROM Manager afterwords. This way we only have to run it once.


This is optional. Cloud services will add things like Netflix and streaming services to your Steam library.

Select Cloud Services in EmuDeck and the above window will open.

Select Manage Cloud Services then click Ok.


Here you can select any of the streaming services you have and they will be added to your Steam Library. These are not native clients. They are links to the website for each service but they will be opened in full screen with no address bars so it feels more like a native client. Once done click Ok.

Next select Manage Remote Play Clients and click Ok.


These are to remotely connect to PCs and consoles. Example: Chiaki is a remote play for the PS5 console. When done Click start. It will install the selected clients and take you back to the main menu.

Now select change settings and click Ok.


This simply lets you select which browser to open the above services in. The right column is if the browser is installed on your system. Pick your favorite browser then click Ok.

In the main menu select Quit and click Ok. You will get a message telling you to run Steam ROM Manager to add them to your Steam library.


When you launch Steam ROM Manager it has to close Steam in the background to add the games to your library. You may have to use the L2/R2 triggers for the mouse clicks but lately I have still been able to use the touch pads like normal. Click on Yes.


Parsers are what selects the artwork and systems to add to your Steam Library.

ES-DE is Emulation Station Desktop Edition. And Pegasus are both frontends for organizing roms. Pegasus uses ES-DE scraped files or manually created metadata. ES-DE is a lot more user friendly and I recommend it but you have the option to use both.

Here is what you select to be added to your Steam library. If you added the above cloud services and remote play clients above you will need to turn the toggles on for them now.

My recommendation if you have a large rom library turn off all the toggles other than ES-DE, cloud services, and remote play clients. Adding 100s to 1000s of games to the Steam library will cause the menus to lag and be hard to navigate. If you have a small library turn everything on and they will be added like individual games in your Steam Library.

The Emulators option will add each individual emulator this is handy if you need to change configuration settings or install DLCs. But you can also do that from desktop mode and keep your Steam library less cluttered.

My setup I only turn on ES-DE, Cloud Services, and Remote Play Clients. Everything else is turned off.

Once you are done selecting the systems you want click on the preview button.


It will now start downloading artwork for your games. There will be a number in the upper left corner with how many are left. If you have a large library this will take a long time. Once it’s finished you can change some of the artwork useing the left and right arrows on the posters. There is also a drop down menu on the top to select artwork type. This will have more options with artwork like hero and logo.

When you are happy with the artwork click on Save to Steam. It will start adding everything to the Steam library and you will see a pop up in the upper right corner that says done adding entries. Now you can close Steam rom manager.

If you want to change items later it’s the same process but if your removing entries you will need to select remove from Steam before you save to Steam or the removed items will stay in your library.


When you go back into game mode these will be found in the library under NON-STEAM. There will also be categories for each of the selected parsers. You can keep the categories or you can remove them if you wish. The non Steam game will still be available if you remove the category.

Other options in EmuDeck

Quick Settings

This is simply a quick way to change some settings like autosave and Bezels


Manage Emulators

This is where you can install, uninstall, update, and reset the emulators and software from EmuDeck.


When you select a specific emulator you can reset the configuration for that emulator. This is the first thing I do if I’m having problems with one of them. It usually fixes the problem. This is also where you will install or uninstall them.


EmuDeck Store

Here you can install some free home brew games.

Import Games and Bios


This is EmuDecks tool to copy games and bios from your PC.

Quick and Custom Reset

This is a complete restart of EmuDeck. They will reset all the configurations and setup everything again. This would be used if somehow you messed everything up and nothing works.


Screen Resolution


Quick settings for changing the display resolution. I personally just set them all to 1080p but you can play with them and see what you like and what runs the best.

Retro Achievements


This is a fun one. It will add achievements to classic games that never had them before. You will need to create an account and sign in.

EmuDeck Compressor


This will reduce the file size on some roms to save space.

Cloud Saves


This will backup your rom save files to a cloud storage provider. This is part of there early access program and is not free.

Migrate Installation


Here you can move your rom files from internal storage to the SD card and back. You will need to run Steam ROM Manager again after to correct the file paths. If you have a large library this will take a long time.

EmuDecky


This is a Decky Loader plugin with shortcuts and a few quick settings. You will need a SUDO password to install this.

Gyroscope


This will install a plugin to use the Steam Decks gyro controls in emulators that support it. You will need a SUDO password to install this.

Powertools


Powertools is another Decky Loader plugin for fine tuning system settings on the Steam Deck. You will need a SUDO password to install this.
