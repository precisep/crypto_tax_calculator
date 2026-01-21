<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/web-test', function () {
    return response()->json(['message' => 'Web test route is working']);
});

Route::get('/direct-test', function () {
    return response()->json(['message' => 'Direct test route is working']);
});
