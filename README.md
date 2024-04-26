# XM Cloud Starter Kit (Next JS) with Siteimprove CMS plugin

## QUICK START

1. In an ADMIN terminal:

    ```ps1
    .\init.ps1 -InitEnv -LicenseXmlPath "C:\path\to\license.xml" -AdminPassword "DesiredAdminPassword"
    ```

2. Restart your terminal and run:

    ```ps1
    .\up.ps1
    ```

3. Follow the instructions to [deploy to XM Cloud](#deploy-to-xmcloud)

4. Create Edge token and [query from edge](#query-edge)

***

## Deploy to XM Cloud

> [!IMPORTANT]
> Please review Web.config [transformations](/src/platform/App_Data/xdts/Web.config.xdt) as the updates to the Content Security Policy have been made to support Siteimprove plugin functionality.

> [!TIP]
> To deploy to XMCloud, follow the instructions provided by Sitecore on [doc.sitecore.com](https://doc.sitecore.com/xmc/en/developers/xm-cloud/deploying-xm-cloud.html).

## Navigating the Siteimprove CMS plugin

> [!TIP]
> For further information on how to navigate the Siteimprove plugin, please visit [help.siteimprove.com](https://help.siteimprove.com/support/solutions/folders/80000324134)


## About this template

This Siteimprove CMS Plugin template has been forked from Sitecore's XMCloud [starter template](https://github.com/sitecorelabs/xmcloud-foundation-head) and provided by Siteimprove to help accelerate configuring XM Cloud with the Siteimprove CMS plugin.
