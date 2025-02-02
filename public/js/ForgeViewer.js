var viewer;

function launchViewer(urn) {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };

  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('forgeViewer'), { extensions: [
      'Autodesk.DocumentBrowser',
      'GameExtension',
      'Autodesk.AEC.LevelsExtension', 
      'Autodesk.AEC.Minimap3DExtension'
    ] });

    viewer.start();
    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);

  });
}

function onDocumentLoadSuccess(doc) {
  var viewables = doc.getRoot().getDefaultGeometry();

  // Import for getting AECModelData
  // Model Derivative API
  doc.downloadAecModelData()

  viewer.loadDocumentNode(doc, viewables).then(i => {
    // documented loaded, any action?
    
    // Minimap load 
  //   viewer.addEventListener( Autodesk.Viewing.TEXTURES_LOADED_EVENT, ()=>{
  //     viewer.getExtension("Autodesk.BimWalk").activate();
  // });
  });
}

function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function getForgeToken(callback) {
  fetch('/api/forge/oauth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });
}
