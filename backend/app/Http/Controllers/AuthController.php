<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Calculation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 400);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token,
            'message' => 'Registration successful'
        ]);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 400);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token,
            'message' => 'Login successful'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    }

    public function saveTransactions(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'transactions' => 'required|array',
            'name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 400);
        }

        $calculation = Calculation::create([
            'user_id' => $request->user()->id,
            'name' => $request->name ?? 'Calculation ' . date('Y-m-d H:i:s'),
            'transactions' => $request->transactions,
            'results' => null, // You can calculate and save results here if needed
        ]);

        return response()->json([
            'success' => true,
            'calculation' => $calculation,
            'message' => 'Calculation saved successfully'
        ]);
    }

    public function getCalculations(Request $request)
    {
        $calculations = Calculation::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'calculations' => $calculations
        ]);
    }

    public function getCalculation(Request $request, $id)
    {
        $calculation = Calculation::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->first();

        if (!$calculation) {
            return response()->json([
                'success' => false,
                'message' => 'Calculation not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'calculation' => $calculation
        ]);
    }

    // Google OAuth methods
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            $user = User::where('email', $googleUser->email)->first();
            
            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => Hash::make(Str::random(24)),
                    'google_id' => $googleUser->id,
                ]);
            } else {
                $user->update(['google_id' => $googleUser->id]);
            }
            
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Redirect back to frontend with token
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '?token=' . $token . '&user=' . urlencode(json_encode($user)));
            
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '?error=' . urlencode($e->getMessage()));
        }
    }
}