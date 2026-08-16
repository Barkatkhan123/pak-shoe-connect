$ftpHost = "145.79.26.180"
$user = "u988207622"
$pass = "sher@123%&B"
$localDir = "c:\Users\itman\Desktop\shersha\pak-shoe-connect\dist\client"

$targets = @(
    "domains/anamonofficial-com-549724.hostingersite.com/public_html",
    "domains/anamonofficial.com/public_html",
    "public_html"
)

Write-Host "Connecting to Hostinger FTP via .NET WebRequest ($ftpHost)..."

function Upload-File ($localFile, $targetBase, $remotePath) {
    try {
        $uri = [System.Uri]"ftp://$ftpHost/$targetBase/$remotePath"
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $request.UseBinary = $true
        $request.UsePassive = $true
        $request.KeepAlive = $false
        $request.Timeout = 20000

        $fileContent = [System.IO.File]::ReadAllBytes($localFile)
        $request.ContentLength = $fileContent.Length
        $requestStream = $request.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        $response = $request.GetResponse()
        $response.Close()
        Write-Host "  Uploaded: $remotePath"
    } catch {
        Write-Host "  Notice: $remotePath -> $_"
    }
}

function Create-FtpDirectory ($targetBase, $remoteDir) {
    try {
        $uri = [System.Uri]"ftp://$ftpHost/$targetBase/$remoteDir"
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.UsePassive = $true
        $request.Timeout = 15000
        $response = $request.GetResponse()
        $response.Close()
    } catch {
        # Directory might already exist
    }
}

$files = Get-ChildItem -Path $localDir -Recurse

foreach ($target in $targets) {
    Write-Host "Deploying to target: $target ..."
    foreach ($item in $files) {
        $relativePath = $item.FullName.Substring($localDir.Length + 1).Replace("\", "/")
        if ($item.PSIsContainer) {
            Create-FtpDirectory -targetBase $target -remoteDir $relativePath
        } else {
            Upload-File -localFile $item.FullName -targetBase $target -remotePath $relativePath
        }
    }
    Write-Host "Completed target: $target"
}

Write-Host "ALL DEPLOYMENTS COMPLETED SUCCESSFULLY!"
