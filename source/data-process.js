/**
 * The fixed data chunk size for
 *   [<code>Blob</code>](https://developer.mozilla.org/en/docs/Web/API/Blob)
 *   data type for transfers using DataChannel connection.
 * @attribute _CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @final
 * @required
 * @component DataProcess
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._CHUNK_FILE_SIZE = 49152;

/**
 * The fixed data chunk size for
 *   [<code>dataURL</code>](https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs)
 *   (which is a type of "string" and known as data URIs)
 *   data type for transfers using DataChannel connection.
 * @attribute _CHUNK_DATAURL_SIZE
 * @type Number
 * @private
 * @final
 * @required
 * @component DataProcess
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._CHUNK_DATAURL_SIZE = 1212;

/**
 * The fixed data chunk size for
 *   [<code>Blob</code>](https://developer.mozilla.org/en/docs/Web/API/Blob)
 *   data type for transfers using DataChanel connection on
 *   Firefox based browsers.
 * Limitations is different for Firefox as tested in some PCs (linux predominantly)
 *   that sending a packet size of <code>49152</code>kb from another browser
 *   reflects as <code>16384</code>kb packet size when received.
 * @attribute _MOZ_CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @final
 * @required
 * @component DataProcess
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MOZ_CHUNK_FILE_SIZE = 12288;

/**
 * The list of data types that is transferred using the DataChannel connection.
 * The current supported data type is <code>string</code>. <code>Blob</code>,
 *   <code>ArrayBuffer</code> types support is not yet currently handled or
 *   implemented.
 * @attribute DATA_TRANSFER_DATA_TYPE
 * @type JSON
 * @param {String} BINARY_STRING Data is transferred using
 *   [binary converted strings](https://developer.mozilla.org/en-US/
 *   docs/Web/HTTP/data_URIs).
 * @param {String} ARRAY_BUFFER Data is transferred using
 *   [ArrayBuffers](https://developer.mozilla.org/en-US/docs/Web/JavaScript
  *  /Reference/Global_Objects/ArrayBuffer).
 * @param {String} BLOB Data is transferred using
 *   [Blobs](https://developer.mozilla.org/en/docs/Web/API/Blob).
 * @readOnly
 * @component DataProcess
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob'
};

/**
 * Converts a binary string (base64) string derived from
 *  [dataURL conversion](https://developer.mozilla.org/en-US
 *   /docs/Web/API/FileReader/readAsDataURL)
 *   to a Blob data object.<br>
 * <i>Author: devnull69@stackoverflow.com #6850276</i>
 * @method _base64ToBlob
 * @param {String} dataURL The binary string (base64) to convert.
 * @return {Blob} The converted Blob data object.
 * @private
 * @component DataProcess
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._base64ToBlob = function(dataURL) {
  var byteString = atob(dataURL.replace(/\s\r\n/g, ''));
  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var j = 0; j < byteString.length; j++) {
    ia[j] = byteString.charCodeAt(j);
  }
  // write the ArrayBuffer to a blob, and you're done
  return new Blob([ab]);
};

/**
 * Converts a Blob data object into a binary string (base64) using
 *   [dataURL conversion](https://developer.mozilla.org/en-US
 *   /docs/Web/API/FileReader/readAsDataURL)
 * @method _blobToBase64
 * @param {Blob} data The Blob data object to convert.
 * @param {Function} callback The callback triggered when Blob data
 *   conversion to binary string (base64) has completed.
 * @param {String} callback.data The converted binary string (base64).
 * @private
 * @component DataProcess
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._blobToBase64 = function(data, callback) {
  var fileReader = new FileReader();
  fileReader.onload = function() {
    // Load Blob as dataurl base64 string
    var base64BinaryString = fileReader.result.split(',')[1];
    callback(base64BinaryString);
  };
  fileReader.readAsDataURL(data);
};

/**
 * Chunks a huge Blob data object into smaller Blob data object chunks
 *   based on the chunk sizes provided.
 * If provided Blob data object is smaller than chunk sizes, it will return an array
 *   length of <code>1</code> with the Blob data object.
 * @method _chunkBlobData
 * @param {Blob} blob The huge Blob binary data object.
 * @param {Number} chunkSize The chunk size that the Blob binary data should be cut
 *   into.
 * @return {Array} The array of chunked Blob data objects based on the Blob data
 *   object provided.
 * @private
 * @component DataProcess
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._chunkBlobData = function(blob, chunkSize) {
  var chunksArray = [];
  var startCount = 0;
  var endCount = 0;
  var blobByteSize = blob.size;

  if (blobByteSize > chunkSize) {
    // File Size greater than Chunk size
    while ((blobByteSize - 1) > endCount) {
      endCount = startCount + chunkSize;
      chunksArray.push(blob.slice(startCount, endCount));
      startCount += chunkSize;
    }
    if ((blobByteSize - (startCount + 1)) > 0) {
      chunksArray.push(blob.slice(startCount, blobByteSize - 1));
    }
  } else {
    // File Size below Chunk size
    chunksArray.push(blob);
  }
  return chunksArray;
};

/**
 * Chunks a huge dataURL string (base64 binary string)
 *  into smaller strings based on the chunk length provided.
 * If provided dataURL string is smaller than chunk length, it will return an array
 *   length of <code>1</code> with the dataURL string.
 * @method _chunkDataURL
 * @param {String} dataURL The huge dataURL string (binary string).
 * @param {Number} chunkSize The string (chunk) length that the dataURL string
 *   should be cut into.
 * @return {Array} The array of chunked dataURL strings (base64 binary string)
 *   based on the dataURL string provided.
 * @private
 * @component DataProcess
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._chunkDataURL = function(dataURL, chunkSize) {
  var outputStr = dataURL; //encodeURIComponent(dataURL);
  var dataURLArray = [];
  var startCount = 0;
  var endCount = 0;
  var dataByteSize = dataURL.size || dataURL.length;

  if (dataByteSize > chunkSize) {
    // File Size greater than Chunk size
    while ((dataByteSize - 1) > endCount) {
      endCount = startCount + chunkSize;
      dataURLArray.push(outputStr.slice(startCount, endCount));
      startCount += chunkSize;
    }
    if ((dataByteSize - (startCount + 1)) > 0) {
      chunksArray.push(outputStr.slice(startCount, dataByteSize - 1));
    }
  } else {
    // File Size below Chunk size
    dataURLArray.push(outputStr);
  }

  return dataURLArray;
};

/**
 * Assemble the string chunks of a chunked dataURL string (base64 binary string)
 *   into the original huge dataURL string.
 * @method _assembleDataURL
 * @param {Array} dataURLArray The array of chunked dataURL strings
 *   (base64 binary string) based on the dataURL string provided.
 * @return {String} The original huge dataURL string (base64 binary string).
 * @private
 * @component DataProcess
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._assembleDataURL = function(dataURLArray) {
  var outputStr = '';

  for (var i = 0; i < dataURLArray.length; i++) {
    try {
      outputStr += dataURLArray[i];
    } catch (error) {
      console.error('Malformed', i, dataURLArray[i]);
    }
  }

  return outputStr;
};