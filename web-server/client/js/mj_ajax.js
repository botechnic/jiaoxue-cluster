/**
 * Created by user on 2015/2/2.
 */
function CallBackObject()
{
    this.XmlHttp = this.GetHttpObject();
}

CallBackObject.prototype.GetHttpObject = function()
{
    var xmlhttp;
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        try {
            xmlhttp = new XMLHttpRequest();
        } catch (e) {
            xmlhttp = false;
        }
    }
    return xmlhttp;
}

CallBackObject.prototype.DoCallBack = function(URL)
{
    if( this.XmlHttp )
    {
        if( this.XmlHttp.readyState == 4 || this.XmlHttp.readyState == 0 )
        {
            var oThis = this;
            this.XmlHttp.open('GET', URL);
            this.XmlHttp.onreadystatechange = function(){ oThis.ReadyStateChange(); };
            //this.XmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            this.XmlHttp.send(null);
        }
    }
}

CallBackObject.prototype.AbortCallBack = function()
{
    if( this.XmlHttp )
        this.XmlHttp.abort();
}

CallBackObject.prototype.OnLoading = function()
{
    // Loading
}

CallBackObject.prototype.OnLoaded = function()
{
    // Loaded
}

CallBackObject.prototype.OnInteractive = function()
{
    // Interactive
}

CallBackObject.prototype.OnComplete = function(responseText, responseXml)
{
    // Complete
}

CallBackObject.prototype.OnAbort = function()
{
    // Abort
}

CallBackObject.prototype.OnError = function(status, statusText)
{
    // Error
}

CallBackObject.prototype.ReadyStateChange = function()
{
    if( this.XmlHttp.readyState == 1 )
    {
        this.OnLoading();
    }
    else if( this.XmlHttp.readyState == 2 )
    {
        this.OnLoaded();
    }
    else if( this.XmlHttp.readyState == 3 )
    {
        this.OnInteractive();
    }
    else if( this.XmlHttp.readyState == 4 )
    {
        if( this.XmlHttp.status == 0 )
            this.OnAbort();
        else if( this.XmlHttp.status == 200 && this.XmlHttp.statusText == "OK" )
            this.OnComplete(this.XmlHttp.responseText, this.XmlHttp.responseXML);
        else
            this.OnError(this.XmlHttp.status, this.XmlHttp.statusText, this.XmlHttp.responseText);
    }
}