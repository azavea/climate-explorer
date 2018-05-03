<?php
include_once dirname(__DIR__) . '/functions.php';

?>
<!-- BEGIN HEADER TEMPLATE -->

<header id="main-header">
    <div id="main-nav">
        <a href="https://toolkit.climate.gov" id="header-logo" title="U.S. Climate Resilience Toolkit"><img src="/resources/img/us-climate-resilience-toolkit.png" alt="U.S. Climate Resilience Toolkit"></a>

        <a href="#" id="nav-trigger" class="nav-btn launch-nav"><span class="hamburger"><span class="bar"></span></span><span class="text">Menu</span></a>

        <nav id="subnav">
            <span id="subnav-trigger">More…</span>

            <ul>
              <li><a href="#" id="tour-this-page"><span class="text">Tour This Page</span></a></li>
              <li><a href="/about/"><span class="text">About</span></a></li>
              <li><a href="/definitions/"><span class="text">Definitions</span></a></li>
              <li><a href="/faq/"><span class="text">FAQ</span></a></li>
              <li><a href="/credits/"><span class="text">Credits</span></a></li>
            </ul>
        </nav>

        <div id="breadcrumb">
            <a href="/"><span class="icon icon-arrow-up"></span>Home</a><span class="current"></span>
        </div>
    </div>
</header>

<?php include_once dirname(__DIR__) . '/template/mainnav.php'; ?>

<!-- END HEADER TEMPLATE -->
