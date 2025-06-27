<h1>Set Up Moonlight Game Streaming on Steam Deck</h1>

  <img src=“images/moonlight_steamdeck.png” alt=“Moonlight streaming on Steam Deck” style=“max-width: 100%; height: auto;”>

  <p>
    Want to play your high-end PC games on the Steam Deck without installing them locally? With <strong>Moonlight</strong> and <strong>Sunshine</strong>, you can stream your full desktop gaming experience to the Deck over your home network. This guide walks you through the full process — from installing the tools to optimizing streaming quality and fixing common issues.
  </p>

  <h2>🧰 What You’ll Need</h2>
  <ul>
    <li><strong>Steam Deck</strong> (any model, SteamOS)</li>
    <li><strong>Gaming PC</strong> running Windows 10/11 with a dedicated GPU</li>
    <li><strong>Sunshine</strong> installed on your PC (GameStream-compatible server)</li>
    <li><strong>Moonlight</strong> client installed on the Steam Deck</li>
    <li><strong>5GHz Wi-Fi or Ethernet</strong> for both devices</li>
    <li>Optional: Steam Deck Dock or USB-C hub with Ethernet adapter</li>
  </ul>

  <h2>🔧 Step 1: Install Sunshine on Your Gaming PC</h2>
  <p>Sunshine acts as a replacement for NVIDIA’s now-retired GameStream server. It works with any GPU — AMD, Intel, or NVIDIA — and supports streaming apps, games, or your full desktop.</p>
  <ol>
    <li>Go to <a href=“https://github.com/LizardByte/Sunshine/releases” target=“_blank”>Sunshine Releases</a> on GitHub.</li>
    <li>Download the latest Windows installer and run it.</li>
    <li>After installation, Sunshine will open in your web browser at <code>http://localhost:47990</code>.</li>
    <li>Set a login password and configure basic host settings.</li>
    <li>Click “Applications” and add any EXE file — such as Steam, Epic Games Launcher, or a specific game.</li>
    <li>Take note of your PC’s local IP address (usually something like <code>192.168.x.x</code>).</li>
  </ol>

  <h2>💻 Step 2: Install Moonlight on the Steam Deck</h2>
  <p>Moonlight is a free, open-source client that can pair with Sunshine or NVIDIA GameStream servers.</p>
  <ol>
    <li>On the Steam Deck, press the <strong>Steam button</strong>, then go to <strong>Power > Switch to Desktop Mode</strong>.</li>
    <li>Once in Desktop Mode, open the <strong>Discover Software Center</strong>.</li>
    <li>Search for <strong>Moonlight</strong> and install the app. (Alternatively, run: <code>flatpak install flathub com.moonlight_stream.Moonlight</code>)</li>
    <li>Launch Moonlight from your desktop or from inside Steam (if you’ve added it).</li>
  </ol>

  <h2>🔐 Step 3: Pair Moonlight with Sunshine</h2>
  <p>This links the Steam Deck to your PC so Moonlight can launch apps or games directly.</p>
  <ol>
    <li>In Moonlight, your PC should automatically appear as a host. If not, click “Add Host” and enter your PC’s IP address.</li>
    <li>Click on your PC’s name. A 4-digit pairing PIN will appear.</li>
    <li>On your PC, Sunshine will prompt for this PIN. Enter it to approve the pairing.</li>
    <li>Once paired, you’ll see a list of the applications and games you added in Sunshine.</li>
  </ol>

  <h2>🎮 Step 4: Launch and Configure a Game</h2>
  <ul>
    <li>From Moonlight’s main menu on the Steam Deck, select a game or launcher (e.g., Steam, Epic).</li>
    <li>The stream will start — your Deck is now acting as a display for your PC.</li>
    <li>Steam Deck’s controls will automatically map as an Xbox controller in most games.</li>
    <li>If your controller isn’t working, check Sunshine’s settings for input support and make sure “Gamepad” is enabled.</li>
  </ul>

  <h2>📐 Step 5: Optimize Quality and Latency</h2>
  <ul>
    <li>Use <strong>5GHz Wi-Fi</strong> or wired Ethernet for both devices whenever possible. This reduces lag significantly.</li>
    <li>Open Moonlight’s settings (gear icon) and set:
      <ul>
        <li><strong>Resolution:</strong> 1280x800 (native Steam Deck)</li>
        <li><strong>Framerate:</strong> 60 FPS (or 120 FPS on external displays)</li>
        <li><strong>Bitrate:</strong> 10,000–20,000 kbps depending on your network</li>
      </ul>
    </li>
    <li>Enable <strong>Performance Overlay</strong> to check latency, framerate, and decode performance in real-time.</li>
  </ul>

  <h2>🛠 Common Troubleshooting</h2>
  <ul>
    <li><strong>Moonlight can’t find my PC:</strong> Add your PC manually using its local IP address.</li>
    <li><strong>Controller input doesn’t work:</strong> Open Sunshine settings and confirm controller passthrough is enabled. You may also need to configure Steam Input.</li>
    <li><strong>Lag or choppy video:</strong> Drop resolution to 720p, reduce bitrate, and verify both devices are on the same 5GHz SSID.</li>
    <li><strong>Sunshine doesn’t launch games:</strong> Make sure the app path is correct, and that it runs properly outside of Sunshine first.</li>
  </ul>

  <h2>✅ Summary</h2>
  <p>
    With Moonlight and Sunshine, your Steam Deck becomes a powerful wireless extension of your gaming PC. You can play AAA games, modded setups, or full desktop apps — all while relaxing away from your desk.
  </p>
  <p>
    The setup takes just 15–20 minutes, and once it’s done, you can easily switch between SteamOS-native titles and full-power remote streaming with almost no latency.
  </p>