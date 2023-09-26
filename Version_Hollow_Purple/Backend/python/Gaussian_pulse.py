#! /usr/bin/env python3

import asyncio
from pyvirtualbench import PyVirtualBench, PyVirtualBenchException, FGenWaveformMode
from waveform import GaussianPulse
from websockets.server import serve
from numpy import array, savetxt, arange
import json
from matplotlib import pyplot as plt # Debug

def triggerWaveform(inputs):
    pulse = GaussianPulse(inputs['amplitude'], inputs['frecuency'], inputs['nSamples'], inputs['fs'], inputs['hgw'])

    pulseArray = array(pulse.y)
    sample_rate = 1/float(inputs['sampleRate'] )
    fgen.stop()
    fgen.configure_arbitrary_waveform(pulseArray.tolist(), sample_rate)#Sample rate 100S/s=>0.01 100000=>0.00001
    fgen.run()
    # t = pulse.t  # Debug
    # w = pulse.w
    # pulse.getFFT() 
    # pulseFFT = pulse.y
    # plt.figure(1)
    # plt.subplot(211)
    # plt.plot(t, pulseArray, color="red") # Debug
    # plt.subplot(212)
    # plt.plot(w, pulseFFT, color="blue") # Debug
    # plt.show() # Debug
    

def msoData(sampleRate):
    channel_1 = mso.query_analog_channel(model+'/mso/1')
    # channel_2 = mso.query_analog_channel(model+'/mso/2')
    mso.stop()
    mso.configure_immediate_trigger()
    mso.reset_instrument()
    mso.auto_setup()

    mso.configure_analog_channel(model+'/mso/1', True, channel_1[1], channel_1[2], channel_1[3], channel_1[4])
    # mso.configure_analog_channel(model+'/mso/2', True, channel_2[1], channel_2[2], channel_2[3], channel_2[4])

    # print( mso.query_analog_channel('VB8012-3178C78/mso/2'))
    sample_rate, acquisition_time, pretrigger_time, sampling_mode = mso.query_timing()

    mso.configure_timing(sampleRate, 0.024894966761633427, 0.012447483380816714, sampling_mode)
    print(mso.query_timing())
    channels = mso.query_enabled_analog_channels()
    channels_enabled, number_of_channels = virtualbench.collapse_channel_string(channels)
    print(channels_enabled, number_of_channels)

     
    mso.run()

    return mso.read_analog_digital_u64()[0]

async def echo(websocket):
    async for message in websocket:
        msg = json.loads(message)
        print(msg)
        try:
            if msg['button'] != 'stop':
               triggerWaveform(msg)
               virtualbench.get_calibration_information()
            #    await websocket.send(json.dumps({'data' : msoData(msg['sampleRate'])}))
            #    while True:
            #       await websocket.send(json.dumps({'data' : msoData(msg['sampleRate'])}))
            #       await asyncio.sleep(1)
            else:  
                fgen.stop()
                mso.reset_instrument() 
                virtualbench.release()
        except PyVirtualBenchException as e:
            print("Error/Warning %d occurred\n%s" % (e.status, e))
        finally:
            virtualbench.release()
    

if __name__ == '__main__':
    global model, virtualbench, fgen, mso
    model = 'VB8012-3178C78'
    virtualbench = PyVirtualBench(model)
    mso = virtualbench.acquire_mixed_signal_oscilloscope()
    fgen = virtualbench.acquire_function_generator()
    async def main():
        print("Service Up....")
        async with serve(echo, "0.0.0.0", 1025):
            await asyncio.Future()  # run forever

    asyncio.run(main())

