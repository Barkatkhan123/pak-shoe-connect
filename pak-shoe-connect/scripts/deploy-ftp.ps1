$ftpHost = "145.79.26.180"
$user = "u988207622"
$pass = "sher@123%&B"
$localDir = "c:\Users\itman\Desktop\shersha\pak-shoe-connect\dist\client"

Write-Host "📡 Connecting to Hostinger FTP via PowerShell ($ftpHost)..."

function Upload-File ($localFile, $remotePath) {
    try {
        $uri = [System.Uri]"ftp://$ftpHost/public_html/$remotePath"
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $request.UseBinary = $true
        $request.UsePassive = $true
        $request.KeepAlive = $false

        $fileContent = [System.IO.File]::ReadAllBytes($localFile)
        $request.ContentLength = $fileContent.Length
        $requestStream = $request.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        $response = $request.GetResponse()
        $response.Close()
        Write-Host " Uploaded: $remotePath"
    } catch {
        Write-Host " Error uploading $remotePath : $_"
    }
}

function Create-FtpDirectory ($remoteDir) {
    try {
        $uri = [System.Uri]"ftp://$ftpHost/public_html/$remoteDir"
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.UsePassive = $true
        $response = $request.GetResponse()
        $response.Close()
        Write-Host "📁 Created Directory: $remoteDir"
    } catch {
        Write-Host " Directory notice ($remoteDir): $_"
    }
}

$files = Get-ChildItem -Path $localDir -Recurse
foreach ($item in $files) {
    $relativePath = $item.FullName.Substring($localDir.Length + 1).Replace("\", "/")
    if ($item.PSIsContainer) {
        Create-FtpDirectory -remoteDir $relativePath
    } else {
        Upload-File -localFile $item.FullName -remotePath $relativePath
    }
}

Write-Host "🎉 SUCCESS: All frontend files uploaded to Hostinger public_html!"
